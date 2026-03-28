"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"

interface StickyAddToCartProps {
    product: {
        name: string;
        price: number;
        image: string;
        stock: number;
    };
    onAdd: () => void;
    isAdding: boolean;
    isVisible: boolean;
}

export function StickyAddToCart({ product, onAdd, isAdding, isVisible }: StickyAddToCartProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                >
                    <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover object-center"
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                                <p className="text-sm font-medium text-primary">{formatPrice(product.price)}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                            <div className="sm:hidden flex flex-col">
                                <span className="font-semibold">{formatPrice(product.price)}</span>
                            </div>

                            <Button
                                size="lg"
                                className="w-full sm:w-auto rounded-full px-8 font-semibold shadow-lg hover:shadow-xl transition-all h-12"
                                disabled={product.stock <= 0 || isAdding}
                                onClick={onAdd}
                            >
                                {isAdding ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
