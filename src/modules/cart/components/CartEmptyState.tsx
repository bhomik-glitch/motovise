import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function CartEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 max-w-sm mb-8">
                Looks like you haven&apos;t added anything to your cart yet. Browse our products and find something you love.
            </p>
            <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
                Start Shopping
            </Link>
        </div>
    );
}
