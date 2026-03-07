"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { CheckoutStepper } from "./CheckoutStepper";
import { OrderSummary } from "./OrderSummary";
import { AddressStep } from "./steps/AddressStep";
import { ShippingStep } from "./steps/ShippingStep";
import { PaymentStep } from "./steps/PaymentStep";
import { ReviewStep } from "./steps/ReviewStep";
import { useCart } from "@/modules/cart/hooks/useCart";
import { useRouter } from "next/navigation";
import { addressService } from "@/modules/account/services/addressService";
import { CheckoutStep, SHIPPING_METHODS } from "@/types/checkout";
import { queryKeys } from "@/lib/queryKeys";

const STEP_ORDER: CheckoutStep[] = ["address", "shipping", "payment", "review"];

const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 40 : -40,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 40 : -40,
        opacity: 0,
    }),
};

export function CheckoutContainer() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
    const [direction, setDirection] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Record<CheckoutStep, boolean>>({
        address: false,
        shipping: false,
        payment: false,
        review: false,
    });

    // Checkout state
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>("standard");
    const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD" | null>(null);
    const [notes] = useState("");

    const { cart, isLoading: cartLoading } = useCart({
        refetchOnWindowFocus: false,
        staleTime: 0,
    });

    const { status } = useSession();

    // Move useQuery above any return
    const { data: addresses } = useQuery({
        queryKey: queryKeys.addresses,
        queryFn: addressService.getAddresses,
        enabled: status === 'authenticated',
    });

    const navigate = useCallback((nextStep: CheckoutStep) => {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        const nextIndex = STEP_ORDER.indexOf(nextStep);
        setDirection(nextIndex > currentIndex ? 1 : -1);
        setCompletedSteps((prev) => ({ ...prev, [currentStep]: true }));
        setCurrentStep(nextStep);
    }, [currentStep]);

    const goBack = useCallback(() => {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentStep(STEP_ORDER[currentIndex - 1]);
        }
    }, [currentStep]);

    const goToStep = useCallback((step: CheckoutStep) => {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        const targetIndex = STEP_ORDER.indexOf(step);
        setDirection(targetIndex > currentIndex ? 1 : -1);
        setCurrentStep(step);
    }, [currentStep]);

    // Redirect if cart is empty after loading - use useEffect to avoid hook violation
    useEffect(() => {
        if (!cartLoading && (!cart || (cart.items && cart.items.length === 0))) {
            router.push("/cart");
        }
    }, [cart, cartLoading, router]);

    // Handle early return at the END of hook declarations
    if (cartLoading || !cart || (cart.items && cart.items.length === 0)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const selectedAddress = addresses?.find((a) => a.id === selectedAddressId);
    const selectedShippingMethod = SHIPPING_METHODS.find((m) => m.id === selectedShippingMethodId) ?? null;

    return (
        <div className="min-h-screen py-8 sm:py-12">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Checkout</h1>
                    <p className="text-sm text-muted-foreground mt-1">Complete your purchase in a few easy steps.</p>
                </div>

                {/* Stepper */}
                <div className="mb-8 sm:mb-10">
                    <CheckoutStepper currentStep={currentStep} completedSteps={completedSteps} />
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-10">
                    {/* Step Content */}
                    <div className="overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
                            >
                                {currentStep === "address" && (
                                    <AddressStep
                                        selectedAddressId={selectedAddressId}
                                        onSelect={setSelectedAddressId}
                                        onNext={() => navigate("shipping")}
                                    />
                                )}
                                {currentStep === "shipping" && (
                                    <ShippingStep
                                        selectedMethodId={selectedShippingMethodId}
                                        onSelect={setSelectedShippingMethodId}
                                        onNext={() => navigate("payment")}
                                        onBack={goBack}
                                    />
                                )}
                                {currentStep === "payment" && (
                                    <PaymentStep
                                        selectedMethod={paymentMethod}
                                        onSelect={setPaymentMethod}
                                        onNext={() => navigate("review")}
                                        onBack={goBack}
                                    />
                                )}
                                {currentStep === "review" && (
                                    <ReviewStep
                                        cart={cart}
                                        address={selectedAddress}
                                        shippingMethodId={selectedShippingMethodId}
                                        paymentMethod={paymentMethod}
                                        notes={notes}
                                        onEdit={goToStep}
                                        onBack={goBack}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Order Summary — sticky in sidebar on desktop */}
                    <div className="lg:block">
                        <OrderSummary
                            cart={cart}
                            shippingMethod={selectedShippingMethod}
                            isLoading={cartLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
