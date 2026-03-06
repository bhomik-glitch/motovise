// ─────────────────────────────────────────────────────────
// modules/admin/orders/orders.types.ts
// All types for the Admin Orders Management module.
// ─────────────────────────────────────────────────────────

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURNED'
    | 'REFUNDED';

export type PaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'FAILED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED';

export type PaymentMethod =
    | 'PREPAID'
    | 'COD'
    | 'UPI'
    | 'CARD'
    | 'NETBANKING'
    | 'WALLET';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ManualReviewStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OrderItem {
    id: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface ShipmentInfo {
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: string;
    estimatedDelivery?: string;
    pincode?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    createdAt: string;
    customerName: string;
    customerEmail?: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    fraudScore: number;
    riskLevel: RiskLevel;
    chargebackFlag: boolean;
    manualReviewStatus: ManualReviewStatus;
    items?: OrderItem[];
    shipment?: ShipmentInfo;
    notes?: string;
}

export interface OrdersQueryParams {
    page: number;
    limit: number;
    status?: OrderStatus | '';
    riskLevel?: RiskLevel | '';
    paymentMethod?: PaymentMethod | '';
    search?: string;
}

export interface OrdersResponse {
    data: Order[];
    total: number;
    page: number;
    limit: number;
}

// ── Lifecycle guard helpers ────────────────────────────────

/** Orders in a terminal state — no further actions possible. */
export const TERMINAL_STATUSES: OrderStatus[] = [
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED',
];

/** Orders eligible for cancellation. */
export const CANCELLABLE_STATUSES: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
];

/** Orders eligible for shipment. */
export const SHIPPABLE_STATUSES: OrderStatus[] = ['CONFIRMED', 'PROCESSING'];
