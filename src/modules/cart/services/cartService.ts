import api from '@/lib/api-client';
import { Cart, CartItem } from '@/types/cart';

export const cartService = {
    getCart: async (): Promise<Cart> => {
        const { data } = await api.get<{ success: boolean; data: Cart }>('/cart');
        return {
            ...data.data,
            totalQuantity: data.data.itemCount, // Alias for compatibility
            totalAmount: data.data.subtotal    // Alias for compatibility
        };
    },

    addItem: async (productId: string, quantity: number = 1): Promise<CartItem> => {
        const { data } = await api.post<{ success: boolean; data: CartItem }>('/cart/add', { productId, quantity });
        return data.data;
    },

    updateItem: async (productId: string, quantity: number): Promise<CartItem> => {
        const { data } = await api.patch<{ success: boolean; data: CartItem }>(`/cart/update/${productId}`, { quantity });
        return data.data;
    },

    removeItem: async (productId: string): Promise<void> => {
        await api.delete(`/cart/remove/${productId}`);
    },
};
