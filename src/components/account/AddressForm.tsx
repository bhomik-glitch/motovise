"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"

const addressSchema = z.object({
    type: z.string().min(1, "Address type (Home/Work) is required"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^[0-9]{10}$/, "Must be a valid 10-digit Indian phone number"),
    street: z.string().min(5, "Street address must be at least 5 characters"),
    pincode: z.string().regex(/^[0-9]{6}$/, "Must be a valid 6-digit Indian PIN code"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
})

export type AddressFormValues = z.infer<typeof addressSchema>

const PINCODE_MAP: Record<string, { city: string, state: string }> = {
    "400001": { city: "Mumbai", state: "Maharashtra" },
    "110001": { city: "New Delhi", state: "Delhi" },
    "560001": { city: "Bengaluru", state: "Karnataka" },
    "600001": { city: "Chennai", state: "Tamil Nadu" },
    "700001": { city: "Kolkata", state: "West Bengal" },
}

interface AddressFormProps {
    onSubmit: (values: AddressFormValues) => Promise<void>
    onCancel?: () => void
    onSuccess?: () => void
}

function getErrorMessage(error: unknown): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
    ) {
        return (error as { message: string }).message
    }

    return "Unable to save address. Please try again."
}

export function AddressForm({ onSubmit, onSuccess, onCancel }: AddressFormProps) {
    const [isDetecting, setIsDetecting] = React.useState(false)
    const [submitError, setSubmitError] = React.useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            type: "Home"
        }
    })

    const pincodeValue = watch("pincode")

    React.useEffect(() => {
        if (pincodeValue && pincodeValue.length === 6) {
            setIsDetecting(true)
            const timer = setTimeout(() => {
                const data = PINCODE_MAP[pincodeValue]
                if (data) {
                    setValue("city", data.city, { shouldValidate: true })
                    setValue("state", data.state, { shouldValidate: true })
                }
                setIsDetecting(false)
            }, 600)
            return () => clearTimeout(timer)
        }
    }, [pincodeValue, setValue])

    const handleAddressSubmit = async (values: AddressFormValues) => {
        setSubmitError(null)

        try {
            await onSubmit(values)
            onSuccess?.()
        } catch (error) {
            setSubmitError(getErrorMessage(error))
        }
    }

    return (
        <Card className="border-2 border-primary/20 shadow-lg ring-1 ring-black/5 dark:ring-white/10 relative overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="absolute top-0 left-0 h-1 bg-primary" />
            <CardHeader>
                <CardTitle>Add New Address</CardTitle>
                <CardDescription>Enter your delivery information below.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleAddressSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="type">Address Type</Label>
                            <Input id="type" placeholder="Home, Work, etc." {...register("type")} />
                            {errors.type && <p className="text-[10px] text-destructive">{errors.type.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Recipient Name" {...register("name")} />
                            {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+91</span>
                                <Input id="phone" className="pl-10" placeholder="9876543210" maxLength={10} {...register("phone")} />
                            </div>
                            {errors.phone && <p className="text-[10px] text-destructive">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input id="street" placeholder="123 Main Street" {...register("street")} />
                            {errors.street && <p className="text-[10px] text-destructive">{errors.street.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" placeholder="400001" maxLength={6} {...register("pincode")} />
                            {errors.pincode && <p className="text-[10px] text-destructive">{errors.pincode.message}</p>}
                            <p className="text-[10px] text-muted-foreground">Auto-detects city and state.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City {isDetecting && <Loader2 className="inline ml-1 h-3 w-3 animate-spin" />}</Label>
                            <Input id="city" placeholder="Mumbai" {...register("city")} />
                            {errors.city && <p className="text-[10px] text-destructive">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State {isDetecting && <Loader2 className="inline ml-1 h-3 w-3 animate-spin" />}</Label>
                            <Input id="state" placeholder="Maharashtra" {...register("state")} />
                            {errors.state && <p className="text-[10px] text-destructive">{errors.state.message}</p>}
                        </div>
                    </div>
                    {submitError && <p className="text-xs text-destructive">{submitError}</p>}
                    <div className="flex justify-end gap-2 pt-4">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} className="focus-visible:ring-2 focus-visible:ring-primary">
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isSubmitting} className="focus-visible:ring-2 focus-visible:ring-primary">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Address
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
