import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateStock } from '../hooks/useUpdateProduct';
import { Package } from 'lucide-react';

export interface StockUpdateModalProps {
    productId: string;
    currentStock: number;
    open: boolean;
    onClose: () => void;
}

const stockSchema = z.object({
    stock: z.coerce
        .number({ invalid_type_error: 'Stock must be a number' })
        .int('Stock must be a whole number')
        .min(0, 'Stock cannot be negative'),
});

type StockFormData = z.infer<typeof stockSchema>;

export function StockUpdateModal({
    productId,
    currentStock,
    open,
    onClose,
}: StockUpdateModalProps) {
    const { mutate: updateStock, isPending } = useUpdateStock();

    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors },
    } = useForm<StockFormData>({
        resolver: zodResolver(stockSchema),
        defaultValues: { stock: currentStock },
    });

    // Re-seed form whenever the modal opens for a (possibly different) product
    useEffect(() => {
        if (open) {
            reset({ stock: currentStock });
            // Slight delay to let the modal render before focusing
            const t = setTimeout(() => setFocus('stock'), 80);
            return () => clearTimeout(t);
        }
    }, [open, currentStock, reset, setFocus]);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const onSubmit = (data: StockFormData) => {
        updateStock(
            { id: productId, stock: data.stock },
            { onSuccess: () => onClose() }
        );
    };

    if (!open) return null;

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Panel */}
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-700">
                        <Package size={18} />
                    </span>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Update Stock</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Current stock: <span className="font-medium text-gray-700">{currentStock}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="px-6 py-5 space-y-4">
                        <div>
                            <label
                                htmlFor="stock-input"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                New Stock Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="stock-input"
                                type="number"
                                min={0}
                                step={1}
                                {...register('stock')}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 transition
                                    ${errors.stock
                                        ? 'border-red-400 focus:ring-red-300'
                                        : 'border-gray-300 focus:ring-gray-300 focus:border-gray-400'
                                    }`}
                                placeholder="e.g. 25"
                                disabled={isPending}
                            />
                            {errors.stock && (
                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                    <span>⚠</span> {errors.stock.message}
                                </p>
                            )}
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed">
                            Enter the <strong>absolute</strong> stock value, not a delta. The current
                            backend stock will be replaced with this number.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Updating…' : 'Update Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
