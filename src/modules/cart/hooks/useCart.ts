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
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        },
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
            cartService.updateItem(id, quantity),
        onMutate: async ({ id, quantity }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.cart });
            const previousCart = queryClient.getQueryData<Cart>(queryKeys.cart);
            queryClient.setQueryData<Cart>(queryKeys.cart, (old) => {
                if (!old) return old;
                const newItems = old.items.map((item) =>
                    (item.productId ?? item.product.id) === id
                        ? { ...item, quantity, itemTotal: Number(item.product.price || 0) * quantity }
                        : item
                );
                return {
                    ...old,
                    items: newItems,
                    subtotal: newItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0),
                };
            });
            return { previousCart };
        },
        onError: (_err, _variables, context: any) => {
            if (context?.previousCart) {
                queryClient.setQueryData(queryKeys.cart, context.previousCart);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        },
    });

    const removeItemMutation = useMutation({
        mutationFn: (id: string) => cartService.removeItem(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.cart });
            const previousCart = queryClient.getQueryData<Cart>(queryKeys.cart);
            queryClient.setQueryData<Cart>(queryKeys.cart, (old) => {
                if (!old) return old;
                const newItems = old.items.filter(
                    (item) => (item.productId ?? item.product.id) !== id
                );
                return {
                    ...old,
                    items: newItems,
                    itemCount: newItems.length,
                    subtotal: newItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0),
                };
            });
            return { previousCart };
        },
        onError: (_err, _variables, context: any) => {
            if (context?.previousCart) {
                queryClient.setQueryData(queryKeys.cart, context.previousCart);
            }
        },
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
