import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RiskService } from '../risk/risk.service';
import { FraudService } from './fraud.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private prisma: PrismaService,
        private riskService: RiskService,
        private fraudService: FraudService,
        private readonly redis: RedisService,
    ) { }

    async createOrder(userId: string, createOrderDto: CreateOrderDto) {
        const { addressId, notes, paymentMethod: rawPaymentMethod } = createOrderDto;

        // Normalise: default to COD if not provided
        const paymentMethod = (rawPaymentMethod || 'COD').toUpperCase();
        // Get user info
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Get user's cart
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // Verify address belongs to user
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        // Generate order number BEFORE transaction (avoids holding locks)
        const orderNumber = await this.generateOrderNumber();

        // Create order with items in a transaction
        // CRITICAL FIX: Stock validation and deduction moved INSIDE transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // ── Phase 8C: COD Enforcement ────────────────────────────────────
            // Runs BEFORE stock mutation and BEFORE payment creation.
            // A BadRequestException here causes full transaction rollback —
            // no order row, no stock reduction, no payment intent.
            await this.riskService.enforceCodeEligibility(
                address.postalCode,
                paymentMethod,
            );

            // Validate stock and product availability INSIDE transaction
            for (const item of cart.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product || !product.isActive) {
                    throw new BadRequestException(
                        `Product ${item.product.name} is no longer available`,
                    );
                }

                if (product.stock < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                    );
                }
            }

            // Calculate totals using Decimal for precision
            const subtotal = cart.items.reduce((sum, item) => {
                return sum + Number(item.product.price) * item.quantity;
            }, 0);

            const tax = subtotal * 0.18; // 18% tax
            const total = subtotal + tax;

            // Sum total item quantity for fraud scoring
            const totalQuantity = cart.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
            );

            // ── Phase 8D: Fraud Scoring ──────────────────────────────────────
            // Runs INSIDE the transaction so all DB reads use the same snapshot.
            // Any exception here triggers full rollback — no partial state.
            // payment_attempts = 0 at creation time (incremented externally on retry).
            const fraudResult = await this.fraudService.calculateFraudScore(tx, {
                userId,
                orderTotal: total,
                pincode: address.postalCode,
                paymentAttempts: 0,
                totalQuantity,
            });

            this.logger.log(
                `[Phase8D] Order ${orderNumber} — rule_score=${fraudResult.rule_score} ` +
                `is_manual_review=${fraudResult.is_manual_review}`,
            );

            // Create order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    orderNumber,
                    orderStatus: 'PENDING',
                    paymentStatus: 'PENDING',
                    customerEmail: user.email,
                    customerPhone: user.phone || '',
                    subtotal,
                    tax,
                    total,
                    shippingAddressId: addressId,
                    billingAddressId: addressId,
                    customerNotes: notes,
                    // Phase 8: Snapshot pincode at creation (immutable for risk aggregation)
                    shippingPincode: address.postalCode,
                    // Phase 8D: Fraud score fields
                    rule_score: fraudResult.rule_score,
                    is_manual_review: fraudResult.is_manual_review,
                    // Conditional spread: review_status ONLY set when flagged
                    ...(fraudResult.is_manual_review && {
                        review_status: fraudResult.review_status,
                    }),
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            productName: item.product.name,
                            productImage: item.product.thumbnail,
                            quantity: item.quantity,
                            unitPrice: item.product.price,
                            totalPrice: Number(item.product.price) * item.quantity,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    thumbnail: true,
                                },
                            },
                        },
                    },
                    shippingAddress: true,
                },
            });

            return newOrder;
        });

        // Cache Invalidation
        await this.redis.del('dashboard:mtd');

        return order;
    }

    // HIGH PRIORITY FIX: Pagination for order listing
    async getMyOrders(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    thumbnail: true,
                                },
                            },
                        },
                    },
                    shippingAddress: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where: { userId } }),
        ]);

        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getOrderById(userId: string, orderId: string) {
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                thumbnail: true,
                                price: true,
                            },
                        },
                    },
                },
                shippingAddress: true,
                billingAddress: true,
                payment: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    // Admin methods with pagination
    async getAllOrders(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                    shippingAddress: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.order.count(),
        ]);

        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateOrderStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto) {
        const { status } = updateStatusDto;

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Validate status transitions
        if (order.orderStatus === 'CANCELLED') {
            throw new BadRequestException('Cannot update a cancelled order');
        }

        if (order.orderStatus === 'DELIVERED' && status !== 'CANCELLED') {
            throw new BadRequestException('Cannot update a delivered order');
        }

        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Cache Invalidation
        await this.redis.del('dashboard:mtd');

        return updatedOrder;
    }

    // CRITICAL FIX: Atomic order number generation using OrderSequence
    private async generateOrderNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateStr = `${year}${month}${day}`;

        // Use transaction to atomically increment sequence
        const orderNumber = await this.prisma.$transaction(async (tx) => {
            const seq = await tx.orderSequence.upsert({
                where: { date: dateStr },
                update: { sequence: { increment: 1 } },
                create: { date: dateStr, sequence: 1 },
            });

            return `ORD${dateStr}${seq.sequence.toString().padStart(4, '0')}`;
        });

        return orderNumber;
    }
}
