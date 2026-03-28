import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListOrdersDto, RiskLevelFilter } from './dto/list-orders.dto';
import { Prisma } from '@prisma/client';

// Maps frontend riskLevel filter to rule_score ranges in the DB
const RISK_LEVEL_SCORE_RANGES: Record<RiskLevelFilter, { gte?: number; lte?: number }> = {
    [RiskLevelFilter.LOW]: { lte: 30 },
    [RiskLevelFilter.MEDIUM]: { gte: 31, lte: 60 },
    [RiskLevelFilter.HIGH]: { gte: 61 },
};

// Derives a display risk level from rule_score
function deriveRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score <= 30) return 'LOW';
    if (score <= 60) return 'MEDIUM';
    return 'HIGH';
}

@Injectable()
export class AdminOrdersService {
    constructor(private readonly prisma: PrismaService) { }

    async listOrders(dto: ListOrdersDto) {
        const { page, limit, status, paymentMethod, riskLevel, search } = dto;
        const skip = (page - 1) * limit;

        // ── Build WHERE clause ──────────────────────────────
        const where: Prisma.OrderWhereInput = {};

        if (status) {
            where.orderStatus = status as any;
        }

        if (paymentMethod) {
            where.paymentMethod = paymentMethod as any;
        }

        if (riskLevel) {
            const range = RISK_LEVEL_SCORE_RANGES[riskLevel];
            where.rule_score = range;
        }

        if (search?.trim()) {
            const term = search.trim();
            where.OR = [
                { orderNumber: { contains: term, mode: 'insensitive' } },
                { user: { name: { contains: term, mode: 'insensitive' } } },
            ];
        }

        // ── Execute queries in parallel ───────────────────
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    orderNumber: true,
                    createdAt: true,
                    total: true,
                    paymentMethod: true,
                    paymentStatus: true,
                    orderStatus: true,
                    rule_score: true,
                    is_manual_review: true,
                    review_status: true,
                    chargeback: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        const data = orders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            customerName: order.user?.name ?? 'Unknown',
            customerEmail: order.user?.email,
            totalAmount: Number(order.total),
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            fraudScore: order.rule_score,
            riskLevel: deriveRiskLevel(order.rule_score),
            chargebackFlag: order.chargeback,
            manualReviewStatus: order.is_manual_review
                ? (order.review_status ?? 'PENDING')
                : 'NONE',
        }));

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getOrderById(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                orderNumber: true,
                createdAt: true,
                total: true,
                subtotal: true,
                tax: true,
                shippingCost: true,
                paymentMethod: true,
                paymentStatus: true,
                orderStatus: true,
                rule_score: true,
                is_manual_review: true,
                review_status: true,
                chargeback: true,
                chargeback_amount: true,
                chargeback_date: true,
                trackingNumber: true,
                customerNotes: true,
                shippingPincode: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    select: {
                        id: true,
                        productName: true,
                        productImage: true,
                        quantity: true,
                        unitPrice: true,
                        totalPrice: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                            },
                        },
                    },
                },
                shippingAddress: {
                    select: {
                        fullName: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        state: true,
                        postalCode: true,
                        country: true,
                        phone: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        gateway: true,
                        gatewayOrderId: true,
                        gatewayPaymentId: true,
                        amount: true,
                        currency: true,
                        status: true,
                        method: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }

        return {
            id: order.id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            customerName: order.user?.name ?? 'Unknown',
            customerEmail: order.user?.email,
            totalAmount: Number(order.total),
            subtotal: Number(order.subtotal),
            tax: Number(order.tax),
            shippingCost: Number(order.shippingCost),
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            fraudScore: order.rule_score,
            riskLevel: deriveRiskLevel(order.rule_score),
            chargebackFlag: order.chargeback,
            chargebackAmount: order.chargeback_amount ? Number(order.chargeback_amount) : null,
            chargebackDate: order.chargeback_date,
            manualReviewStatus: order.is_manual_review
                ? (order.review_status ?? 'PENDING')
                : 'NONE',
            notes: order.customerNotes,
            items: order.items.map((item) => ({
                id: item.id,
                productName: item.productName,
                productImage: item.productImage,
                sku: item.product?.sku ?? null,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                totalPrice: Number(item.totalPrice),
            })),
            shipment: {
                trackingNumber: order.trackingNumber,
                pincode: order.shippingPincode,
                address: order.shippingAddress,
            },
            payment: order.payment
                ? {
                    gateway: order.payment.gateway,
                    gatewayOrderId: order.payment.gatewayOrderId,
                    amount: Number(order.payment.amount),
                    currency: order.payment.currency,
                    status: order.payment.status,
                    method: order.payment.method,
                }
                : null,
        };
    }
}
