"use client"

import * as React from "react"
import { Check, Package, Truck, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type OrderTimelineStatus = "Order Placed" | "Payment Confirmed" | "Packed" | "Shipped" | "Out for delivery" | "Delivered";

const STEPS = [
    { label: "Order Placed", icon: Check },
    { label: "Payment Confirmed", icon: Check },
    { label: "Packed", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Out for delivery", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 }
] as const;

export function OrderTimeline({ currentStatus }: { currentStatus: OrderTimelineStatus }) {
    const currentIndex = STEPS.findIndex(s => s.label.toLowerCase() === currentStatus.toLowerCase());

    // Fallback if status not found
    const activeIndex = currentIndex >= 0 ? currentIndex : 0;

    return (
        <div className="relative py-8" aria-label="Order tracking timeline">
            <div className="flex justify-between items-center relative">
                {/* Background line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />

                {/* Active line */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isCurrent = index === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.label} className="relative flex flex-col items-center justify-center min-w-[3rem] z-10 group">
                            <div className={cn(
                                "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white dark:bg-slate-950",
                                isCompleted ? "border-primary text-primary" : "border-slate-200 dark:border-slate-700 text-slate-400",
                                isCurrent ? "ring-4 ring-primary/20 scale-110" : ""
                            )}>
                                <Icon size={16} className={cn("sm:h-5 sm:w-5", isCompleted ? "animate-in zoom-in" : "")} />
                            </div>
                            <span className={cn(
                                "absolute top-12 text-[10px] sm:text-xs font-medium text-center max-w-[80px] sm:max-w-none transition-colors",
                                isCompleted ? "text-foreground" : "text-muted-foreground",
                                isCurrent ? "font-bold text-primary" : ""
                            )}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
