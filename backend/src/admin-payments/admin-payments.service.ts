import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminPaymentsService {
    constructor(private readonly prisma: PrismaService) { }

    async getPayments(query: any) {
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.method) where.method = query.method;
        if (query.search) {
            where.OR = [
                { order: { orderNumber: { contains: query.search, mode: 'insensitive' } } },
                { gatewayPaymentId: { contains: query.search, mode: 'insensitive' } },
                { gatewayOrderId: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        if (query.dateFrom || query.dateTo) {
            where.createdAt = {};
            if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
            if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
        }

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: {
                        include: { user: true }
                    }
                }
            }),
            this.prisma.payment.count({ where })
        ]);

        const formattedData = payments.map(p => ({
            id: p.id,
            orderId: p.order.orderNumber,
            userId: p.order.userId,
            userEmail: p.order.user?.email || '',
            method: p.method || p.gateway === 'cod' ? 'COD' : 'RAZORPAY',
            status: p.status,
            amount: Number(p.amount),
            shippingCost: Number(p.order.shippingCost),
            chargeback: p.order.chargeback,
            razorpayOrderId: p.gatewayOrderId,
            createdAt: p.createdAt.toISOString()
        }));

        return {
            data: formattedData,
            total,
            page,
            limit
        };
    }

    async getPaymentAttempts(paymentId: string) {
        // Since we don't have a dedicated attempts table in the schema, 
        // we'll return a mock list or a single history based on the payment record itself.
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId }
        });

        if (!payment) {
            return [];
        }

        return [
            {
                id: `att_${payment.id}`,
                paymentId: payment.id,
                razorpayPaymentId: payment.gatewayPaymentId,
                razorpayOrderId: payment.gatewayOrderId,
                status: payment.status,
                errorCode: payment.status === 'FAILED' ? 'ERR_PAYMENT_FAILED' : null,
                gatewayResponse: 'Processed by internal gateway',
                createdAt: payment.updatedAt.toISOString()
            }
        ];
    }
}
