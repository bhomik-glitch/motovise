import Image from 'next/image';
import Link from 'next/link';
import { Trash2, RotateCcw } from 'lucide-react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { CartItem as CartItemType } from '@/types/cart';
import { QuantitySelector } from './QuantitySelector';
import { formatCurrency } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (id: string, newQuantity: number) => void;
    onRemove: (id: string) => void;
    isUpdating?: boolean;
    isRemoving?: boolean;
}

export function CartItem({ item, onUpdateQuantity, onRemove, isUpdating, isRemoving }: CartItemProps) {
    const { product, quantity } = item;
    // VERY IMPORTANT: backend expects productId for update/remove operations!
    const id = product.id;

    const [isDeleted, setIsDeleted] = useState(false);
    const removeTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleDecrease = () => {
        if (quantity > 1) {
            onUpdateQuantity(id, quantity - 1);
        }
    };

    const handleIncrease = () => {
        onUpdateQuantity(id, quantity + 1);
    };

    const handleRemoveClick = () => {
        setIsDeleted(true);
        // Start a 5-second timer before actually removing from state
        removeTimerRef.current = setTimeout(() => {
            onRemove(id);
        }, 5000);
    };

    const handleUndo = () => {
        setIsDeleted(false);
        if (removeTimerRef.current) {
            clearTimeout(removeTimerRef.current);
            removeTimerRef.current = null;
        }
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (removeTimerRef.current) {
                clearTimeout(removeTimerRef.current);
            }
        };
    }, []);

    const itemTotal = item.itemTotal;

    if (isDeleted) {
        return (
            <motion.li
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className="py-4 border-b border-gray-200 last:border-0"
            >
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-inner">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-foreground">{product?.name || 'Item'}</span> removed from cart.
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUndo}
                        className="gap-2 h-8 text-primary hover:text-primary hover:bg-primary/10"
                    >
                        <RotateCcw size={14} />
                        Undo
                    </Button>
                </div>
            </motion.li>
        )
    }

    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`relative group overflow-hidden border-b border-gray-200 last:border-0 ${isRemoving ? 'opacity-50 pointer-events-none grayscale' : ''}`}
        >
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.2, right: 0 }}
                onDragEnd={(e, info) => {
                    if (info.offset.x < -100) {
                        handleRemoveClick();
                    }
                }}
                className="flex py-6 sm:py-8 bg-white dark:bg-slate-950 relative z-10 w-full cursor-grab active:cursor-grabbing"
            >
                <div className="flex-shrink-0 relative aspect-square w-20 sm:w-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm pointer-events-none">
                    <Image
                        src={product?.thumbnail || product?.images?.[0] || '/images/product-placeholder.png'}
                        alt={product?.name || 'Product'}
                        fill
                        className="object-cover object-center"
                        sizes="80px"
                    />
                </div>

                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                            <div className="flex justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                                    <Link href={`/product/${product?.slug || id}`} className="hover:underline transition-colors decoration-primary/30 underline-offset-4">
                                        {product?.name || 'Unknown Product'}
                                    </Link>
                                </h3>
                            </div>
                            <div className="mt-1 flex text-sm">
                                <p className="text-gray-500">{typeof product?.category === 'string' ? product.category : product?.category?.name || 'Category'}</p>
                            </div>
                            <p className="mt-1 text-sm font-medium text-gray-900 sm:hidden">
                                {formatCurrency(product?.price || 0)}
                            </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9 flex flex-col items-start sm:items-end justify-between">
                            <p className="hidden text-base font-medium text-gray-900 sm:block">
                                {formatCurrency(itemTotal)}
                            </p>

                            <div className="mt-4 flex items-center gap-4">
                                <QuantitySelector
                                    quantity={quantity}
                                    onDecrease={handleDecrease}
                                    onIncrease={handleIncrease}
                                    isLoading={isUpdating}
                                />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRemoveClick}
                                    disabled={isRemoving}
                                    className="h-8 w-8 text-gray-400 hover:text-destructive hover:bg-destructive/10"
                                    aria-label="Remove item"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Background color indicating swipe-to-delete action */}
            <div className="absolute inset-y-0 right-0 w-full bg-destructive/10 text-destructive flex items-center justify-end px-8 z-0">
                <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-60 transition-opacity">
                    <Trash2 className="h-5 w-5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Slide to Delete</span>
                </div>
            </div>
        </motion.li>
    );
}
