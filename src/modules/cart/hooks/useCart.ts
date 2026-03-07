import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { cartService } from '../services/cartService';
import { Cart, CartItem } from '@/types/cart';
import { queryKeys } from '@/lib/queryKeys';

export function useCart(options?: Partial<UseQueryOptions<Cart>>) {
    const queryClient = useQueryClient();
    const { status } = useSession();

    const { data: cart, isLoading, error } = useQuery<Cart>({
        queryKey: queryKeys.cart,
        queryFn: cartService.getCart,
        enabled: status === 'authenticated',
        staleTime: 0,
        ...options,
    });

    const addItemMutation = useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
            cartService.addItem(productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        },
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
            cartService.updateItem(id, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        },
    });

    const removeItemMutation = useMutation({
        mutationFn: (id: string) => cartService.removeItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
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
