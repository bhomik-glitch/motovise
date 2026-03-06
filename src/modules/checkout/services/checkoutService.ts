import api from '@/lib/api-client';
import { Order } from '@/types/order';

interface CreateOrderInput {
    addressId: string;
    notes?: string;
    paymentMethod?: string; // 'COD', 'PREPAID', 'UPI'
}

interface InitiatePaymentInput {
    orderId: string;
    paymentMethod: 'RAZORPAY' | 'COD';
}

interface VerifyPaymentInput {
    orderId: string;
    paymentId: string;
    signature: string;
}

export const checkoutService = {
    createOrder: async (data: CreateOrderInput): Promise<Order> => {
        const response = await api.post('/orders', data);
        return response.data.data;
    },

    initiatePayment: async (data: InitiatePaymentInput) => {
        const response = await api.post('/payments/initiate', data);
        return response.data.data; // { success, gatewayOrderId, amount, currency, orderNumber }
    },

    verifyPayment: async (data: VerifyPaymentInput) => {
        const response = await api.post('/payments/verify', data);
        return response.data.data; // { success, message, order }
    },
};
