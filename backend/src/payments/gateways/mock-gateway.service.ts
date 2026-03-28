import { Injectable } from '@nestjs/common';
import {
    PaymentGateway,
    GatewayOrder,
    VerifyPaymentPayload,
} from '../interfaces/payment-gateway.interface';

/**
 * Mock Payment Gateway Service
 * 
 * Simulates Razorpay behavior for testing without API keys.
 * Can be swapped with RazorpayGatewayService when keys are available.
 */
@Injectable()
export class MockGatewayService implements PaymentGateway {
    /**
     * Create a mock payment order
     * @param amount Amount in paise (INR)
     * @param metadata Order metadata
     * @returns Mock gateway order
     */
    async createOrder(amount: number, metadata: any): Promise<GatewayOrder> {
        // Simulate gateway order creation
        const mockOrderId = `mock_order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        return {
            id: mockOrderId,
            amount,
            currency: 'INR',
            status: 'created',
        };
    }

    /**
     * Verify mock payment signature
     * 
     * Mock validation logic:
     * - signature === 'valid_signature' → valid
     * - anything else → invalid
     * 
     * @param payload Verification payload
     * @returns true if signature is 'valid_signature'
     */
    async verifyPayment(payload: VerifyPaymentPayload): Promise<boolean> {
        // Mock signature validation
        // In production, this would verify HMAC signature from Razorpay
        return payload.signature === 'valid_signature';
    }

    /**
     * Generate a valid mock signature for testing
     * @param orderId Gateway order ID
     * @param paymentId Gateway payment ID
     * @returns Mock signature
     */
    generateMockSignature(orderId: string, paymentId: string): string {
        // In real Razorpay, this would be:
        // crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex')
        return 'valid_signature';
    }
}
