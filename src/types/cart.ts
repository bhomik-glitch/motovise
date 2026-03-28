import { Product } from './product';

export interface CartItem {
    id: string;
    productId?: string; // Fallback mapping in hooks
    quantity: number;
    product: Product;
    itemTotal: number;
}

export interface Cart {
    id: string;
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    totalAmount?: number; // legacy/alias
    totalQuantity?: number; // legacy/alias
}
