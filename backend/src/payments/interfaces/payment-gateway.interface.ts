/**
 * Payment Gateway Interface
 * 
 * This interface defines the contract for payment gateway implementations.
 * It allows swapping between MockGateway and RazorpayGateway without
 * changing business logic.
 */

export interface GatewayOrder {
    id: string;
    amount: number;
    currency: string;
    status: string;
}

export interface VerifyPaymentPayload {
    orderId: string;
    paymentId: string;
    signature: string;
}

export interface PaymentGateway {
    /**
     * Create a payment order in the gateway
     * @param amount Amount in smallest currency unit (paise for INR)
     * @param metadata Additional order metadata
     * @returns Gateway order details
     */
    createOrder(amount: number, metadata: any): Promise<GatewayOrder>;

    /**
     * Verify payment signature
     * @param payload Payment verification payload
     * @returns true if signature is valid, false otherwise
     */
    verifyPayment(payload: VerifyPaymentPayload): Promise<boolean>;
}
