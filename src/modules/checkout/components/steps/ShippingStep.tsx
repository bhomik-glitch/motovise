"use client";

import { motion } from "framer-motion";
import { Truck, Zap, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SHIPPING_METHODS, ShippingMethod } from "@/types/checkout";
import { cn, formatPrice } from "@/lib/utils";

interface ShippingStepProps {
    selectedMethodId: string | null;
    onSelect: (methodId: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
    standard: <Truck size={18} />,
    express: <Zap size={18} />,
    "next-day": <Package size={18} />,
};

export function ShippingStep({ selectedMethodId, onSelect, onNext, onBack }: ShippingStepProps) {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Shipping Method</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose a delivery speed that works for you.</p>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Shipping methods">
                {SHIPPING_METHODS.map((method, index) => {
                    const isSelected = selectedMethodId === method.id;
                    return (
                        <motion.button
                            key={method.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => onSelect(method.id)}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.07 }}
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.998 }}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                                isSelected
                                    ? "border-primary bg-primary/[0.03]"
                                    : "border-border hover:border-primary/40"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                    isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {ICONS[method.id]}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{method.name}</p>
                                <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <p className={cn("text-sm font-bold", method.price === 0 && "text-green-600 dark:text-green-400")}>
                                    {method.price === 0 ? "Free" : formatPrice(method.price)}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {method.estimatedDays === "1" ? "Tomorrow" : `${method.estimatedDays} days`}
                                </p>
                            </div>

                            {isSelected && (
                                <motion.div
                                    layoutId="shipping-check"
                                    className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <Check size={12} className="text-primary-foreground" strokeWidth={3} />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onBack}
                    className="w-full sm:w-auto min-h-[48px] text-base"
                >
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!selectedMethodId}
                    size="lg"
                    className="w-full sm:flex-1 sm:min-w-[180px] min-h-[48px] text-base gap-2 font-semibold"
                >
                    Continue to Payment
                </Button>
            </div>
        </div>
    );
}
