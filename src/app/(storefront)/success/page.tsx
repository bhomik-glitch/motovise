"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Suspense } from "react";

function SuccessContent() {
    const params = useSearchParams();
    const orderId = params.get("orderId");
    const orderNumber = params.get("orderNumber");
    const paymentStatus = params.get("paymentStatus");

    const isCOD = paymentStatus === "COD";
    const isPaid = paymentStatus === "PAID";

    const deliveryDescription = isCOD
        ? "Your order will be confirmed and dispatched within 1-2 business days. Pay in cash upon delivery."
        : "Payment confirmed! Your order will be dispatched within 1-2 business days.";

    return (
        <div className="flex min-h-[70vh] items-center justify-center py-12 px-4">
            <div className="w-full max-w-md text-center space-y-6">
                {/* Animated checkmark */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="mx-auto h-24 w-24 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center shadow-lg"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                    >
                        <CheckCircle2 size={52} className="text-green-500" strokeWidth={1.5} />
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl font-bold tracking-tight">Order Placed!</h1>
                    <p className="text-muted-foreground">Thank you for shopping with us.</p>
                </motion.div>

                {/* Order details card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10 text-left">
                        <CardContent className="py-5 space-y-4">
                            {orderNumber && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">Order Number</span>
                                    <span className="font-mono font-semibold text-foreground">{orderNumber}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Payment Status</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isCOD ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                                    {isCOD ? "Pay on Delivery" : "Paid"}
                                </span>
                            </div>
                            <div className="flex items-start gap-3 pt-2 border-t">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                                    <Package size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Estimated Delivery</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{deliveryDescription}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex flex-col gap-3 sm:flex-row sm:justify-center"
                >
                    <Button asChild size="lg" className="gap-2 font-semibold">
                        <Link href="/products">
                            <ShoppingBag size={16} /> Continue Shopping
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="gap-2">
                        <Link href="/">
                            <Home size={16} /> Go Home
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
