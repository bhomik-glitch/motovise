import { Address } from './address';

export type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

export interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: string;
}

export interface CheckoutState {
    currentStep: CheckoutStep;
    selectedAddressId: string | null;
    selectedShippingMethodId: string | null;
    paymentMethod: 'RAZORPAY' | 'COD' | null;
    stepsCompleted: Record<CheckoutStep, boolean>;
    notes: string;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
    {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Delivery in 5-7 business days',
        price: 0,
        estimatedDays: '5-7',
    },
    {
        id: 'express',
        name: 'Express Shipping',
        description: 'Delivery in 2-3 business days',
        price: 1500, // $15.00
        estimatedDays: '2-3',
    },
    {
        id: 'next-day',
        name: 'Next Day Delivery',
        description: 'Delivery by tomorrow evening',
        price: 3000, // $30.00
        estimatedDays: '1',
    },
];
