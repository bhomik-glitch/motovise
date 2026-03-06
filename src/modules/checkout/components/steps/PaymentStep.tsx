"use client";

import { motion } from "framer-motion";
import { CreditCard, Banknote, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PaymentMethodType = "RAZORPAY" | "COD";

interface PaymentStepProps {
    selectedMethod: PaymentMethodType | null;
    onSelect: (method: PaymentMethodType) => void;
    onNext: () => void;
    onBack: () => void;
}

const PAYMENT_OPTIONS: {
    id: PaymentMethodType;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
}[] = [
        {
            id: "RAZORPAY",
            label: "Pay Online",
            description: "Credit / Debit card, UPI, NetBanking, or Wallets via Razorpay",
            icon: <CreditCard size={20} />,
            badge: "Recommended",
        },
        {
            id: "COD",
            label: "Cash on Delivery",
            description: "Pay in cash when your order arrives at your doorstep",
            icon: <Banknote size={20} />,
        },
    ];

export function PaymentStep({ selectedMethod, onSelect, onNext, onBack }: PaymentStepProps) {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Payment Method</h2>
                <p className="text-sm text-muted-foreground mt-1">Select how you&apos;d like to pay for your order.</p>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Payment methods">
                {PAYMENT_OPTIONS.map((option, index) => {
                    const isSelected = selectedMethod === option.id;
                    return (
                        <motion.button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => onSelect(option.id)}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
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
                                    "h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                    isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {option.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold">{option.label}</p>
                                    {option.badge && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                            {option.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                            </div>

                            {isSelected && (
                                <motion.div
                                    layoutId="payment-check"
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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground"
            >
                <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
                Your payment information is encrypted and secure. We never store your card details.
            </motion.div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button variant="outline" size="lg" onClick={onBack} className="sm:w-auto">
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!selectedMethod}
                    size="lg"
                    className="flex-1 sm:flex-none sm:min-w-[180px] gap-2 font-semibold"
                >
                    Review Order
                </Button>
            </div>
        </div>
    );
}
