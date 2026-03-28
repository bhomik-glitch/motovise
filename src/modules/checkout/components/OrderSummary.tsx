"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronDown, ChevronUp, Package } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn, formatPrice } from "@/lib/utils";
import { Cart } from "@/types/cart";
import { ShippingMethod } from "@/types/checkout";

interface OrderSummaryProps {
    cart: Cart | undefined;
    shippingMethod: ShippingMethod | null;
    isLoading?: boolean;
}

export function OrderSummary({ cart, shippingMethod, isLoading }: OrderSummaryProps) {
    const [expanded, setExpanded] = useState(false);
    const itemCount = cart?.totalQuantity ?? 0;
    const subtotal = cart?.totalAmount ?? 0;
    const shippingCost = shippingMethod?.price ?? 0;
    const total = subtotal + shippingCost;

    return (
        <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sticky top-24">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ShoppingBag size={18} className="text-primary" />
                        Order Summary
                    </CardTitle>
                    {/* Mobile toggle */}
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground"
                        aria-expanded={expanded}
                        aria-label="Toggle order summary"
                    >
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Items list — always visible on desktop, toggleable on mobile */}
                <AnimatePresence initial={false}>
                    {(expanded || true) && (
                        <motion.div
                            key="items"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
                                {isLoading
                                    ? Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="h-14 w-14 rounded-lg bg-muted flex-shrink-0" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-3 bg-muted rounded w-3/4" />
                                                <div className="h-3 bg-muted rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))
                                    : cart?.items.map((item) => (
                                        <div key={item.productId} className="flex gap-3">
                                            <div className="relative h-14 w-14 rounded-lg bg-muted overflow-hidden flex-shrink-0 ring-1 ring-black/5">
                                                {item.product?.images?.[0] ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.product.images[0]}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                        <Package size={20} />
                                                    </div>
                                                )}
                                                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium break-words leading-tight">{item.product?.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {formatPrice(item.product?.price ?? 0)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium flex-shrink-0">
                                                {formatPrice((item.product?.price ?? 0) * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Totals */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{isLoading ? "—" : formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>
                            {shippingMethod
                                ? shippingCost === 0
                                    ? "Free"
                                    : formatPrice(shippingCost)
                                : <span className="text-muted-foreground italic text-xs">Select shipping</span>}
                        </span>
                    </div>
                </div>

                <div className="h-px bg-border" />

                <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <motion.span
                        key={total}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isLoading ? "—" : formatPrice(total)}
                    </motion.span>
                </div>

                <p className="text-[11px] text-muted-foreground text-center">
                    Taxes calculated at checkout. Free returns within 30 days.
                </p>
            </CardContent>
        </Card>
    );
}
