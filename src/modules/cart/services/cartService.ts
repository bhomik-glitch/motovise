import api from '@/lib/api-client';
import { Cart, CartItem } from '@/types/cart';

export const cartService = {
    getCart: async (): Promise<Cart> => {
        const { data } = await api.get<{ success: boolean; data: Cart }>('/cart');
        const cart = data.data;
        return {
            ...cart,
            subtotal: Number(cart.subtotal || 0),
            items: (cart.items ?? []).map((item) => ({
                ...item,
                itemTotal: Number(item.itemTotal || 0),
                product: item.product ? {
                    ...item.product,
                    price: Number(item.product.price || 0),
                    compareAtPrice: item.product.compareAtPrice != null ? Number(item.product.compareAtPrice) : null,
                } : item.product,
            })),
            totalQuantity: cart.itemCount,
            totalAmount: Number(cart.subtotal || 0),
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
