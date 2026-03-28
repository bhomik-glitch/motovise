import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
    quantity: number;
    onDecrease: () => void;
    onIncrease: () => void;
    isLoading?: boolean;
    className?: string;
}

export function QuantitySelector({ quantity, onDecrease, onIncrease, isLoading, className }: QuantitySelectorProps) {
    return (
        <div className={cn("flex items-center border rounded-md w-fit bg-white overflow-hidden", className)}>
            <button
                type="button"
                onClick={onDecrease}
                disabled={quantity <= 1 || isLoading}
                className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
                aria-label="Decrease quantity"
            >
                <Minus className="h-4 w-4" />
            </button>
            <div className="px-4 py-1 text-sm font-medium min-w-[3rem] text-center text-gray-900 select-none">
                {quantity}
            </div>
            <button
                type="button"
                onClick={onIncrease}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
                aria-label="Increase quantity"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}
