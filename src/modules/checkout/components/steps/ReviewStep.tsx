"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MapPin, Truck, CreditCard, Banknote, Package, Edit2, ShoppingBag,
    AlertCircle, Loader2, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { checkoutService } from "@/modules/checkout/services/checkoutService";
import { Address } from "@/types/address";
import { SHIPPING_METHODS, ShippingMethod } from "@/types/checkout";
import { Cart } from "@/types/cart";

interface ReviewStepProps {
    cart: Cart | undefined;
    address: Address | undefined;
    shippingMethodId: string | null;
    paymentMethod: "RAZORPAY" | "COD" | null;
    notes: string;
    onEdit: (step: "address" | "shipping" | "payment") => void;
    onBack: () => void;
}

function formatPrice(paise: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
    return (
        <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b">
                <p className="text-sm font-semibold">{title}</p>
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-4 transition-all"
                    aria-label={`Edit ${title}`}
                >
                    <Edit2 size={12} /> Edit
                </button>
            </div>
            <CardContent className="py-4">{children}</CardContent>
        </Card>
    );
}

export function ReviewStep({ cart, address, shippingMethodId, paymentMethod, notes, onEdit, onBack }: ReviewStepProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const [placed, setPlaced] = useState(false);

    const shippingMethod = SHIPPING_METHODS.find((m) => m.id === shippingMethodId) ?? null;
    const subtotal = cart?.totalAmount ?? 0;
    const shippingCost = shippingMethod?.price ?? 0;
    const total = subtotal + shippingCost;

    const placeOrderMutation = useMutation({
        mutationFn: async () => {
            if (!address?.id) throw new Error("No address selected");
            if (!paymentMethod) throw new Error("No payment method selected");

            // Step 1: Create the order
            const paymentMethodParam = paymentMethod === "RAZORPAY" ? "PREPAID" : "COD";
            const order = await checkoutService.createOrder({
                addressId: address.id,
                notes: notes || undefined,
                paymentMethod: paymentMethodParam,
            });

            // Step 2: Initiate payment
            const paymentInit = await checkoutService.initiatePayment({
                orderId: order.id,
                paymentMethod: paymentMethod,
            });

            if (paymentMethod === "COD") {
                // COD: order confirmed directly, just clear cart and redirect
                return { orderId: order.id, orderNumber: paymentInit.orderNumber ?? order.id, paymentStatus: "COD" };
            }

            // For Razorpay — in a real integration we'd open the Razorpay UI here.
            // This implementation uses the mock: simulate verify with mock values.
            const verifyResult = await checkoutService.verifyPayment({
                orderId: order.id,
                paymentId: paymentInit.gatewayOrderId ?? "mock_pay",
                signature: "valid_signature",
            });

            return {
                orderId: order.id,
                orderNumber: verifyResult.order?.orderNumber ?? order.id,
                paymentStatus: verifyResult.order?.paymentStatus ?? "PAID",
            };
        },
        onSuccess: ({ orderId, orderNumber, paymentStatus }) => {
            setPlaced(true);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            setTimeout(() => {
                router.push(`/success?orderId=${orderId}&orderNumber=${orderNumber}&paymentStatus=${paymentStatus}`);
            }, 600);
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message ?? err?.message ?? "Something went wrong. Please try again.");
        },
    });

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Review Your Order</h2>
                <p className="text-sm text-muted-foreground mt-1">Everything look good? Place your order when ready.</p>
            </div>

            {/* Address */}
            <Section title="Delivery Address" onEdit={() => onEdit("address")}>
                {address ? (
                    <div className="flex gap-3">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary h-fit mt-0.5">
                            <MapPin size={14} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{address.name}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {address.street}, {address.city}, {address.state} – {address.zip}
                            </p>
                            {address.phone && <p className="text-xs text-muted-foreground mt-0.5">{address.phone}</p>}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No address selected</p>
                )}
            </Section>

            {/* Shipping */}
            <Section title="Shipping Method" onEdit={() => onEdit("shipping")}>
                {shippingMethod ? (
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 items-center">
                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                <Truck size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{shippingMethod.name}</p>
                                <p className="text-xs text-muted-foreground">{shippingMethod.description}</p>
                            </div>
                        </div>
                        <span className={cn("text-sm font-semibold", shippingMethod.price === 0 && "text-green-600 dark:text-green-400")}>
                            {shippingMethod.price === 0 ? "Free" : formatPrice(shippingMethod.price)}
                        </span>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No shipping method selected</p>
                )}
            </Section>

            {/* Payment */}
            <Section title="Payment Method" onEdit={() => onEdit("payment")}>
                <div className="flex gap-3 items-center">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        {paymentMethod === "COD" ? <Banknote size={14} /> : <CreditCard size={14} />}
                    </div>
                    <p className="text-sm font-medium">
                        {paymentMethod === "COD" ? "Cash on Delivery" : "Pay Online (Razorpay)"}
                    </p>
                </div>
            </Section>

            {/* Order Items */}
            <Section title={`Items (${cart?.totalQuantity ?? 0})`} onEdit={() => { }}>
                <div className="space-y-3">
                    {cart?.items.map((item) => (
                        <div key={item.productId} className="flex gap-3 items-center">
                            <div className="relative h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 ring-1 ring-black/5">
                                <Image
                                    src={item.product?.thumbnail || item.product?.images?.[0] || '/images/product-placeholder.png'}
                                    alt={item.product?.name || "Product"}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.product?.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium flex-shrink-0">
                                {formatPrice((item.product?.price ?? 0) * item.quantity)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Shipping</span>
                        <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-1 border-t mt-1">
                        <span>Total</span><span>{formatPrice(total)}</span>
                    </div>
                </div>
            </Section>

            {/* Error */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                    role="alert"
                >
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                </motion.div>
            )}

            {/* CTA */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onBack}
                    disabled={placeOrderMutation.isPending || placed}
                    className="w-full sm:w-auto min-h-[48px] text-base"
                >
                    Back
                </Button>
                <Button
                    onClick={() => placeOrderMutation.mutate()}
                    disabled={placeOrderMutation.isPending || placed}
                    size="lg"
                    className="w-full sm:flex-1 min-h-[48px] text-base gap-2 font-semibold"
                >
                    {placed ? (
                        <>
                            <CheckCircle2 size={18} className="animate-bounce" /> Order Placed!
                        </>
                    ) : placeOrderMutation.isPending ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Placing Order…
                        </>
                    ) : (
                        <>
                            <ShoppingBag size={18} />
                            {paymentMethod === "COD" ? `Pay ${formatPrice(total)} on Delivery` : `Pay ${formatPrice(total)} Now`}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
