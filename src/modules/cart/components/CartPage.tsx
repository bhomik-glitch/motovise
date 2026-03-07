'use client';

import { Suspense, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { CartEmptyState } from './CartEmptyState';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { AnimatePresence } from 'framer-motion';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function CartPage() {
    const { status } = useSession();
    const router = useRouter();
    const {
        cart,
        isLoading,
        error,
        updateItem,
        removeItem,
        isUpdating,
        isRemoving
    } = useCart();

    if (status === 'unauthenticated') {
        return (
            <div className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Please sign in</h2>
                    <p className="mt-2 text-gray-500">You need to be logged in to view your cart.</p>
                    <div className="mt-6">
                        <Button onClick={() => router.push('/login')}>Sign In</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center text-red-600">
                    <h2 className="text-2xl font-bold">Error loading cart</h2>
                    <p className="mt-2 text-gray-500">Please try again later or contact support.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <CartSkeleton />;
    }

    const hasItems = cart?.items && cart.items.length > 0;

    return (
        <div className="bg-white min-h-[calc(100vh-200px)]">
            <div className="mx-auto max-w-2xl px-4 pb-24 pt-24 md:pt-28 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="mt-8 flex flex-col items-start">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-left">Shopping Cart</h1>
                </div>

                {!hasItems ? (
                    <div className="mt-10">
                        <CartEmptyState />
                    </div>
                ) : (
                    <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                        <section aria-labelledby="cart-heading" className="lg:col-span-7">
                            <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                            <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
                                <AnimatePresence initial={false}>
                                    {cart.items.map((item) => (
                                        <CartItem
                                            key={item.product.id}
                                            item={item}
                                            onUpdateQuantity={(id, quantity) => updateItem({ id, quantity })}
                                            onRemove={removeItem}
                                            isUpdating={isUpdating}
                                        />
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </section>

                        {/* Order summary */}
                        <CartSummary
                            subtotal={cart.subtotal || 0}
                            shippingEstimate={0} // To be implemented by checkout/shipping module
                            taxEstimate={0}      // To be implemented by checkout/shipping module
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
