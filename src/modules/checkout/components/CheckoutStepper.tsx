"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckoutStep } from "@/types/checkout";

interface Step {
    id: CheckoutStep;
    label: string;
    number: number;
}

const STEPS: Step[] = [
    { id: "address", label: "Address", number: 1 },
    { id: "shipping", label: "Shipping", number: 2 },
    { id: "payment", label: "Payment", number: 3 },
    { id: "review", label: "Review", number: 4 },
];

interface CheckoutStepperProps {
    currentStep: CheckoutStep;
    completedSteps: Record<CheckoutStep, boolean>;
}

export function CheckoutStepper({ currentStep, completedSteps }: CheckoutStepperProps) {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

    return (
        <nav aria-label="Checkout progress" className="w-full">
            <ol className="flex items-center w-full">
                {STEPS.map((step, index) => {
                    const isCompleted = completedSteps[step.id];
                    const isCurrent = step.id === currentStep;
                    const isPast = index < currentIndex;

                    return (
                        <li key={step.id} className={cn("flex items-center", index < STEPS.length - 1 ? "flex-1" : "")}>
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            backgroundColor: isCompleted || isPast
                                                ? "hsl(var(--primary))"
                                                : isCurrent
                                                    ? "hsl(var(--primary) / 0.1)"
                                                    : "hsl(var(--muted))",
                                            borderColor: isCurrent
                                                ? "hsl(var(--primary))"
                                                : isCompleted || isPast
                                                    ? "hsl(var(--primary))"
                                                    : "hsl(var(--border))",
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className={cn(
                                            "w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors",
                                        )}
                                        aria-current={isCurrent ? "step" : undefined}
                                    >
                                        {isCompleted || isPast ? (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            >
                                                <Check size={16} className="text-primary-foreground" strokeWidth={3} />
                                            </motion.div>
                                        ) : (
                                            <span className={cn(isCurrent ? "text-primary" : "text-muted-foreground")}>
                                                {step.number}
                                            </span>
                                        )}
                                    </motion.div>
                                    {isCurrent && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-primary"
                                            animate={{ scale: [1, 1.15, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-medium hidden sm:block whitespace-nowrap",
                                        isCurrent ? "text-primary" : isPast || isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {index < STEPS.length - 1 && (
                                <div className="flex-1 mx-2 sm:mx-4 mt-[-1rem]">
                                    <div className="relative h-0.5 bg-border rounded-full overflow-hidden">
                                        <motion.div
                                            className="absolute inset-y-0 left-0 bg-primary rounded-full"
                                            initial={false}
                                            animate={{ width: isPast || isCompleted ? "100%" : "0%" }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
