import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CartSummaryProps {
    subtotal: number;
    shippingEstimate?: number;
    taxEstimate?: number;
    isCheckoutLoading?: boolean;
}

export function CartSummary({
    subtotal,
    shippingEstimate = 0, // 0 means free shipping or calculated at checkout
    taxEstimate = 0,
    isCheckoutLoading = false,
}: CartSummaryProps) {
    const total = subtotal + shippingEstimate + taxEstimate;

    // Animated number component for subtotal changes
    const AnimatedPrice = ({ value }: { value: number }) => (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, position: 'absolute' }}
                transition={{ duration: 0.2 }}
                className="inline-block"
            >
                {formatCurrency(value)}
            </motion.span>
        </AnimatePresence>
    );

    return (
        <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 sticky top-24 border border-gray-100"
        >
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                Order summary
            </h2>

            <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900 relative flex justify-end">
                        <AnimatedPrice value={subtotal} />
                    </dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="flex items-center text-sm text-gray-600">
                        <span>Shipping estimate</span>
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                        {shippingEstimate === 0 ? 'Calculated at checkout' : formatCurrency(shippingEstimate)}
                    </dd>
                </div>

                {taxEstimate > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <dt className="flex text-sm text-gray-600">Tax estimate</dt>
                        <dd className="text-sm font-medium text-gray-900">{formatCurrency(taxEstimate)}</dd>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                    <dd className="text-base font-bold text-gray-900 relative flex justify-end">
                        <AnimatedPrice value={total} />
                    </dd>
                </div>
            </dl>

            <div className="mt-8 gap-4 flex flex-col">
                <Link
                    href="/checkout"
                    className={`w-full flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-gray-50 transition-colors ${isCheckoutLoading ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                >
                    {isCheckoutLoading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Processing...
                        </>
                    ) : (
                        'Checkout'
                    )}
                </Link>
                <div className="text-center text-sm text-gray-500">
                    <p>
                        or{' '}
                        <Link href="/" className="font-medium text-black hover:text-gray-800 hover:underline">
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
