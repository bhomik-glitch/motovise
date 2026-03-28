"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Plus, MapPin } from "lucide-react"
import { AddressCard, AddressItem } from "@/components/account/AddressCard"
import { AddressForm, AddressFormValues } from "@/components/account/AddressForm"
import { SectionSkeleton } from "@/components/ui/PageSkeleton"
import { ErrorState } from "@/components/ui/ErrorState"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api-client"

type ApiAddress = {
    id: string
    name?: string
    fullName?: string
    phone?: string
    line1?: string
    addressLine1?: string
    street?: string
    city?: string
    state?: string
    pincode?: string
    postalCode?: string
    zip?: string
    isDefault?: boolean
}

function extractAddresses(payload: unknown): ApiAddress[] {
    if (Array.isArray(payload)) return payload as ApiAddress[]
    if (!payload || typeof payload !== "object") return []

    const data = payload as Record<string, unknown>
    const sources = [data.data, data.items, data.addresses]

    for (const source of sources) {
        if (Array.isArray(source)) return source as ApiAddress[]

        if (source && typeof source === "object") {
            const nested = source as Record<string, unknown>
            if (Array.isArray(nested.data)) return nested.data as ApiAddress[]
            if (Array.isArray(nested.items)) return nested.items as ApiAddress[]
            if (Array.isArray(nested.addresses)) return nested.addresses as ApiAddress[]
        }
    }

    return []
}

async function fetchAddresses(): Promise<ApiAddress[]> {
    const response = await api.get("/addresses")
    return extractAddresses(response.data)
}

async function createAddress(values: AddressFormValues): Promise<void> {
    await api.post("/addresses", {
        fullName: values.name,
        phone: values.phone,
        addressLine1: values.street,
        city: values.city,
        state: values.state,
        postalCode: values.pincode,
        country: "India",
        isDefault: false,
    })
}

function mapAddress(address: ApiAddress): AddressItem {
    return {
        id: address.id,
        type: "Address",
        name: address.fullName || address.name || "-",
        street: address.line1 || address.addressLine1 || address.street || "-",
        city: address.city || "-",
        state: address.state || "-",
        zip: address.pincode || address.postalCode || address.zip || "-",
        phone: address.phone,
        isDefault: Boolean(address.isDefault),
    }
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
    ) {
        return (error as { message: string }).message
    }

    return fallback
}

export function AddressManager() {
    const [isAdding, setIsAdding] = React.useState(false)
    const router = useRouter()
    const queryClient = useQueryClient()
    const { status } = useSession()

    React.useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login")
        }
    }, [status, router])

    const {
        data: rawAddresses = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["addresses"],
        queryFn: fetchAddresses,
        enabled: status === "authenticated",
    })

    const createAddressMutation = useMutation({
        mutationFn: createAddress,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["addresses"] })
            setIsAdding(false)
        },
    })

    const addresses = React.useMemo(() => rawAddresses.map(mapAddress), [rawAddresses])

    const handleCreateAddress = React.useCallback(async (values: AddressFormValues) => {
        await createAddressMutation.mutateAsync(values)
    }, [createAddressMutation])

    if (status === "loading" || status === "unauthenticated" || (status === "authenticated" && isLoading)) {
        return <SectionSkeleton className="grid grid-cols-1 sm:grid-cols-2 gap-6" />
    }

    if (isError) {
        return (
            <ErrorState
                title="Failed to load addresses"
                message={getErrorMessage(error, "Unable to load your saved addresses right now. Please try again.")}
                onRetry={() => refetch()}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Saved Addresses</h1>
                {addresses.length > 0 && !isAdding && (
                    <Button size="sm" className="h-8 gap-1.5 px-3" onClick={() => setIsAdding(true)}>
                        <Plus size={16} />
                        Add Address
                    </Button>
                )}
            </div>

            {isAdding ? (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AddressForm onSubmit={handleCreateAddress} onCancel={() => setIsAdding(false)} onSuccess={() => setIsAdding(false)} />
                </motion.div>
            ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-400">
                        <MapPin size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Saved Addresses</h3>
                    <p className="text-slate-500 mb-6 max-w-sm">You haven&apos;t added any shipping or billing addresses yet.</p>
                    <Button className="gap-2" onClick={() => setIsAdding(true)}><Plus size={16} /> Add Address</Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 min-h-[400px]">
                    <AnimatePresence>
                        {addresses.map((address, index) => (
                            <div key={address.id} className="h-full">
                                <AddressCard
                                    address={address}
                                    index={index}
                                    onEdit={() => setIsAdding(true)}
                                />
                            </div>
                        ))}
                    </AnimatePresence>

                    <motion.button
                        onClick={() => setIsAdding(true)}
                        whileHover={{ scale: 0.99 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-300 active:bg-primary/5 group h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Add a new address"
                    >
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Plus size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">Add New Address</p>
                            <p className="text-xs text-muted-foreground">Add a different shipping or billing address</p>
                        </div>
                    </motion.button>
                </div>
            )}
        </div>
    )
}
