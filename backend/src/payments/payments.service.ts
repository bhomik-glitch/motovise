import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentGateway } from './interfaces/payment-gateway.interface';
import { CreatePaymentDto, PaymentMethod } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private prisma: PrismaService,
        @Inject('PaymentGateway') private gateway: PaymentGateway,
        private readonly redis: RedisService,
    ) { }

    /**
     * Initiate payment for an order
     * Handles both RAZORPAY and COD payment methods
     */
    async initiatePayment(userId: string, dto: CreatePaymentDto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { items: true },
        });

        // Validation
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('Not your order');
        }

        // IMMUTABILITY CHECK: Prevent payment method switching
        if (order.paymentMethod && order.paymentMethod !== dto.paymentMethod) {
            throw new BadRequestException(
                `Payment method locked to ${order.paymentMethod}. Cannot switch to ${dto.paymentMethod}`,
            );
        }

        // If paymentMethod already set and matches, allow re-initiation (idempotent)
        if (order.paymentMethod === dto.paymentMethod && order.gatewayOrderId) {
            return {
                success: true,
                gatewayOrderId: order.gatewayOrderId,
                amount: Number(order.total),
                currency: 'INR',
                message: 'Payment already initiated',
            };
        }

        // Route to appropriate payment method
        if (dto.paymentMethod === PaymentMethod.COD) {
            return this.initiateCODPayment(userId, dto.orderId);
        } else {
            return this.initiateRazorpayPayment(userId, dto.orderId);
        }
    }

    /**
     * Initiate Razorpay payment
     * Creates gateway order and updates order record
     */
    private async initiateRazorpayPayment(userId: string, orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        // Convert total to paise (smallest currency unit)
        const amountInPaise = Math.round(Number(order.total) * 100);

        // Create gateway order
        const gatewayOrder = await this.gateway.createOrder(amountInPaise, {
            orderId: order.id,
            orderNumber: order.orderNumber,
        });

        // Update order with gateway details
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                paymentMethod: PaymentMethod.RAZORPAY,
                gatewayOrderId: gatewayOrder.id,
            },
        });

        return {
            success: true,
            gatewayOrderId: gatewayOrder.id,
            amount: amountInPaise,
            currency: gatewayOrder.currency,
            orderNumber: order.orderNumber,
        };
    }

    /**
     * Initiate COD payment
     * Directly confirms order without gateway interaction
     */
    private async initiateCODPayment(userId: string, orderId: string) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });

            // DEFENSIVE CHECK: Order has items
            if (!order.items || order.items.length === 0) {
                throw new BadRequestException('Order has no items');
            }

            // Set payment method first
            await tx.order.update({
                where: { id: orderId },
                data: {
                    paymentMethod: PaymentMethod.COD,
                },
            });

            // Use unified confirmation method
            const { alreadyProcessed } = await this.confirmPaymentAndDeductStock(
                orderId,
                `cod_${orderId}`, // Generate COD payment ID
                PaymentMethod.COD,
                tx,
            );

            if (alreadyProcessed) {
                return {
                    success: true,
                    message: 'COD order already confirmed',
                    alreadyProcessed: true,
                    orderNumber: order.orderNumber,
                };
            }

            return {
                success: true,
                message: 'COD order confirmed',
                orderNumber: order.orderNumber,
                orderStatus: OrderStatus.CONFIRMED,
                paymentMethod: PaymentMethod.COD,
            };
        });
    }

    /**
     * Verify payment and finalize order
     * CRITICAL: All operations in atomic transaction
     */
    async verifyPayment(userId: string, dto: VerifyPaymentDto) {
        return this.prisma.$transaction(async (tx) => {
            // ========================================
            // STEP 1: FETCH & VALIDATE ORDER
            // ========================================
            const order = await tx.order.findUnique({
                where: { id: dto.orderId },
                include: { items: true },
            });

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            if (order.userId !== userId) {
                throw new ForbiddenException('Not your order');
            }

            // DEFENSIVE CHECK: Order has items
            if (!order.items || order.items.length === 0) {
                throw new BadRequestException('Order has no items');
            }

            // DEFENSIVE CHECK: gatewayOrderId exists for RAZORPAY
            if (
                order.paymentMethod === PaymentMethod.RAZORPAY &&
                !order.gatewayOrderId
            ) {
                throw new BadRequestException('Gateway order ID missing');
            }

            // ========================================
            // STEP 2: IDEMPOTENCY CHECK
            // ========================================
            if (order.paymentStatus === PaymentStatus.PAID) {
                if (order.gatewayPaymentId !== dto.paymentId) {
                    throw new BadRequestException(
                        `Payment already completed with different payment ID. Expected: ${order.gatewayPaymentId}, Got: ${dto.paymentId}`,
                    );
                }
                return {
                    success: true,
                    message: 'Payment already verified',
                    alreadyProcessed: true,
                    order: {
                        id: order.id,
                        orderNumber: order.orderNumber,
                        status: order.orderStatus,
                        paymentStatus: order.paymentStatus,
                    },
                };
            }

            // IMMUTABILITY CHECK: gatewayPaymentId cannot be overwritten
            if (order.gatewayPaymentId && order.gatewayPaymentId !== dto.paymentId) {
                throw new BadRequestException(
                    `Payment ID mismatch. Expected: ${order.gatewayPaymentId}, Got: ${dto.paymentId}. Possible replay attack.`,
                );
            }

            // ========================================
            // STEP 3: VALIDATE ORDER STATUS
            // ========================================
            if (order.orderStatus === OrderStatus.CANCELLED) {
                throw new BadRequestException('Cannot pay for cancelled order');
            }

            // ========================================
            // STEP 4: VERIFY PAYMENT SIGNATURE
            // ========================================
            const isValid = this.gateway.verifyPayment({
                orderId: order.gatewayOrderId,
                paymentId: dto.paymentId,
                signature: dto.signature,
            });

            this.logger.debug('Signature verification', {
                orderId: dto.orderId,
                orderNumber: order.orderNumber,
                gatewayOrderId: order.gatewayOrderId,
                paymentId: dto.paymentId,
                signatureValid: isValid,
            });

            if (!isValid) {
                // Update status to FAILED and commit (allows retry)
                await tx.order.update({
                    where: { id: dto.orderId },
                    data: {
                        paymentStatus: PaymentStatus.FAILED,
                    },
                });

                // Return error response AFTER transaction commits
                return {
                    success: false,
                    message: 'Invalid payment signature',
                    canRetry: true,
                };
            }

            // ========================================
            // STEP 5: CONFIRM PAYMENT & DEDUCT STOCK
            // ========================================
            const { alreadyProcessed } = await this.confirmPaymentAndDeductStock(
                dto.orderId,
                dto.paymentId,
                PaymentMethod.RAZORPAY,
                tx,
            );

            if (alreadyProcessed) {
                // Already processed, return idempotent response
                return {
                    success: true,
                    message: 'Payment already verified',
                    alreadyProcessed: true,
                    order: {
                        id: order.id,
                        orderNumber: order.orderNumber,
                        status: order.orderStatus,
                        paymentStatus: order.paymentStatus,
                    },
                };
            }

            // ========================================
            // TRANSACTION COMMITS HERE
            // ========================================
            return {
                success: true,
                message: 'Payment verified successfully',
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: OrderStatus.CONFIRMED,
                    paymentStatus: PaymentStatus.PAID,
                },
            };
        });
    }

    /**
     * Confirm payment and deduct stock (UNIFIED METHOD)
     * This is the ONLY place where stock is deducted
     * Uses ATOMIC LOCK to guarantee concurrency safety
     * 
     * @returns alreadyProcessed: true if stock already deducted, false if deducted now
     */
    private async confirmPaymentAndDeductStock(
        orderId: string,
        gatewayPaymentId: string,
        paymentMethod: PaymentMethod,
        tx: Prisma.TransactionClient,
    ): Promise<{ alreadyProcessed: boolean }> {

        // DEBUG: Log order state before lock acquisition
        const orderBeforeLock = await tx.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                orderNumber: true,
                stockDeducted: true,
                paymentStatus: true,
                orderStatus: true,
                gatewayPaymentId: true,
            },
        });

        this.logger.debug('Order state before lock', {
            orderId,
            orderNumber: orderBeforeLock?.orderNumber,
            stockDeducted: orderBeforeLock?.stockDeducted,
            paymentStatus: orderBeforeLock?.paymentStatus,
            orderStatus: orderBeforeLock?.orderStatus,
            gatewayPaymentId: orderBeforeLock?.gatewayPaymentId,
            attemptingPaymentId: gatewayPaymentId,
        });

        // ========================================
        // STEP 1: ATOMIC LOCK ACQUISITION
        // ========================================
        // This is the CRITICAL concurrency control point
        // Only ONE transaction can acquire this lock

        const lock = await tx.order.updateMany({
            where: {
                id: orderId,
                stockDeducted: false, // ← Must not be already deducted
                paymentStatus: {
                    in: [PaymentStatus.PENDING, PaymentStatus.FAILED],
                }, // ← Only allow retry from PENDING/FAILED
                orderStatus: OrderStatus.PENDING, // ← Must be PENDING
                // Payment ID immutability check
                OR: [
                    { gatewayPaymentId: null }, // ← First confirmation
                    { gatewayPaymentId: gatewayPaymentId }, // ← Idempotent retry
                ],
            },
            data: {
                stockDeducted: true, // ← Acquire lock
                stockDeductedAt: new Date(),
                gatewayPaymentId, // ← Set payment ID atomically
            },
        });

        this.logger.debug('Lock acquisition result', { lockCount: lock.count });

        // ========================================
        // STEP 2: CHECK LOCK ACQUISITION
        // ========================================
        if (lock.count === 0) {
            // Lock NOT acquired - already processed or invalid state
            this.logger.debug('Lock NOT acquired - order already processed');
            return { alreadyProcessed: true };
        }

        // Lock acquired successfully - we are the ONLY transaction that will deduct stock

        // ========================================
        // STEP 3: FETCH ORDER WITH ITEMS
        // ========================================
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        // ========================================
        // STEP 4: ATOMIC STOCK DEDUCTION
        // ========================================
        // This happens AFTER lock, BEFORE commit
        // If this fails, entire transaction rolls back (including stockDeducted flag)

        for (const item of order.items) {
            // Get current stock for logging
            const product = await tx.product.findUnique({
                where: { id: item.productId },
                select: { stock: true },
            });

            const previousStock = product.stock;

            const result = await tx.product.updateMany({
                where: {
                    id: item.productId,
                    stock: { gte: item.quantity }, // ← Conditional: only if stock sufficient
                },
                data: {
                    stock: { decrement: item.quantity },
                },
            });

            // Stock deduction failed - insufficient stock
            if (result.count === 0) {
                const currentProduct = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true, stock: true },
                });

                // This will cause transaction rollback
                // stockDeducted flag will revert to false
                // gatewayPaymentId will NOT persist
                throw new BadRequestException(
                    `Insufficient stock for ${currentProduct.name}. Available: ${currentProduct.stock}, Required: ${item.quantity}`,
                );
            }

            // ========================================
            // STEP 5: CREATE INVENTORY LOG
            // ========================================
            await tx.inventoryLog.create({
                data: {
                    productId: item.productId,
                    type: 'SALE',
                    quantity: -item.quantity,
                    previousStock,
                    newStock: previousStock - item.quantity,
                    reason: `Order ${order.orderNumber}`,
                    reference: order.id,
                },
            });
        }

        // ========================================
        // STEP 6: UPDATE ORDER STATUS
        // ========================================
        await tx.order.update({
            where: { id: orderId },
            data: {
                orderStatus: OrderStatus.CONFIRMED,
                paymentStatus:
                    paymentMethod === PaymentMethod.COD
                        ? PaymentStatus.PENDING // COD: paid on delivery
                        : PaymentStatus.PAID, // Razorpay: paid now
            },
        });

        // ========================================
        // STEP 7: CLEAR CART
        // ========================================
        const cart = await tx.cart.findUnique({
            where: { userId: order.userId },
        });

        if (cart) {
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        // Cache Invalidation
        await this.redis.del('dashboard:mtd');

        // Transaction will commit here
        // All changes are atomic: either ALL succeed or ALL rollback

        return { alreadyProcessed: false };
    }

    /**
     * Handle webhook from payment gateway
     * Idempotent and validates all conditions
     */
    async handleWebhook(payload: any) {
        // GUARD 1: Validate gatewayOrderId exists
        const order = await this.prisma.order.findUnique({
            where: { gatewayOrderId: payload.orderId },
            include: { items: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found for gateway order ID');
        }

        // GUARD 2: Idempotency - already processed
        if (order.paymentStatus === PaymentStatus.PAID) {
            return {
                success: true,
                message: 'Webhook already processed',
                alreadyProcessed: true,
            };
        }

        // GUARD 3: Validate order is not cancelled
        if (order.orderStatus === OrderStatus.CANCELLED) {
            return {
                success: false,
                message: 'Order already cancelled',
            };
        }

        // Process webhook in transaction
        return this.prisma.$transaction(async (tx) => {
            // Use unified confirmation method
            const { alreadyProcessed } = await this.confirmPaymentAndDeductStock(
                order.id,
                payload.paymentId,
                PaymentMethod.RAZORPAY,
                tx,
            );

            if (alreadyProcessed) {
                // Already processed by concurrent webhook/verify
                return { success: true, alreadyProcessed: true };
            }

            return { success: true, message: 'Webhook processed' };
        });
    }
}
