import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { cartService } from '../services/cartService';
import { Cart, CartItem } from '@/types/cart';

const CART_QUERY_KEY = ['cart'];

export function useCart() {
    const queryClient = useQueryClient();
    const { status } = useSession();

    const { data: cart, isLoading, error } = useQuery<Cart>({
        queryKey: CART_QUERY_KEY,
        queryFn: cartService.getCart,
        enabled: status === 'authenticated',
        staleTime: 0,
    });

    const addItemMutation = useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
            cartService.addItem(productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        },
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
            cartService.updateItem(id, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        },
    });

    const removeItemMutation = useMutation({
        mutationFn: (id: string) => cartService.removeItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        },
    });

    return {
        cart,
        isLoading,
        error,
        addItem: addItemMutation.mutate,
        addItemAsync: addItemMutation.mutateAsync,
        updateItem: updateItemMutation.mutate,
        removeItem: removeItemMutation.mutate,
        isAdding: addItemMutation.isPending,
        isUpdating: updateItemMutation.isPending,
        isRemoving: removeItemMutation.isPending,
    };
}
