"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/Badge"
import { OrderCard, OrderItem } from "@/components/account/OrderCard"
import { useRouter } from "next/navigation"
import { SectionSkeleton } from "@/components/ui/PageSkeleton"
import { Button } from "@/components/ui/Button"
import { ErrorState } from "@/components/ui/ErrorState"
import { ShoppingCart } from "lucide-react"
import { useSession } from "next-auth/react"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api-client"

type ApiOrder = {
    id: string
    status?: string
    orderStatus?: string
    total?: number | string
    totalAmount?: number | string
    createdAt?: string
    paymentMethod?: string
    paymentStatus?: string
    refundStatus?: string
    items?: Array<{
        image?: string
        thumbnail?: string
        product?: {
            thumbnail?: string
            images?: string[]
        }
    }>
}

const ORDER_STATUS_MAP: Record<string, OrderItem["status"]> = {
    DELIVERED: "Delivered",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    CANCELLED: "Cancelled",
    PENDING: "Processing",
    CONFIRMED: "Processing",
}

function extractOrders(payload: unknown): ApiOrder[] {
    if (Array.isArray(payload)) return payload as ApiOrder[]
    if (!payload || typeof payload !== "object") return []

    const data = payload as Record<string, unknown>
    const sources = [data.data, data.items, data.orders]

    for (const source of sources) {
        if (Array.isArray(source)) return source as ApiOrder[]

        if (source && typeof source === "object") {
            const nested = source as Record<string, unknown>
            if (Array.isArray(nested.data)) return nested.data as ApiOrder[]
            if (Array.isArray(nested.items)) return nested.items as ApiOrder[]
            if (Array.isArray(nested.orders)) return nested.orders as ApiOrder[]
        }
    }

    return []
}

async function fetchOrders(): Promise<ApiOrder[]> {
    try {
        const primaryResponse = await api.get("/orders")
        const primaryOrders = extractOrders(primaryResponse.data)

        if (primaryOrders.length > 0) {
            return primaryOrders
        }

        const payload = primaryResponse.data as Record<string, unknown> | undefined
        const hasExplicitArray =
            Array.isArray(primaryResponse.data) ||
            Array.isArray(payload?.data) ||
            Array.isArray(payload?.items) ||
            Array.isArray(payload?.orders)

        if (hasExplicitArray) {
            return primaryOrders
        }
    } catch (error) {
        const status = (error as { status?: number })?.status
        if (status !== 403 && status !== 404) {
            throw error
        }
    }

    const fallbackResponse = await api.get("/orders/my")
    return extractOrders(fallbackResponse.data)
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

export function OrdersList() {
    const router = useRouter()
    const { status } = useSession()

    React.useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login")
        }
    }, [status, router])

    const {
        data: orders = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["orders"],
        queryFn: fetchOrders,
        enabled: status === "authenticated",
    })

    const handleReorder = () => {
        router.push("/cart")
    }

    if (status === "loading" || status === "unauthenticated" || (status === "authenticated" && isLoading)) {
        return <SectionSkeleton />
    }

    if (isError) {
        return (
            <ErrorState
                title="Failed to load orders"
                message={getErrorMessage(error, "Unable to load your orders right now. Please try again.")}
                onRetry={() => refetch()}
            />
        )
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-400">
                    <ShoppingCart size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm">You haven&apos;t placed any orders yet. Start exploring our collections to find something you&apos;ll love.</p>
                <Button onClick={() => router.push("/products")}>Explore products</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                <Badge variant="secondary" className="px-2 py-0.5 shadow-sm">
                    {orders.length} total orders
                </Badge>
            </div>

            <div className="grid gap-4 min-h-[400px]">
                <AnimatePresence mode="wait">
                    {orders.map((order, index) => {
                        const status = (order.status ?? order.orderStatus ?? "").toUpperCase()
                        const normalizedStatus = ORDER_STATUS_MAP[status] ?? "Processing"
                        const totalValue = Number(order.total ?? order.totalAmount ?? 0)
                        const image =
                            order.items?.[0]?.thumbnail ||
                            order.items?.[0]?.image ||
                            order.items?.[0]?.product?.thumbnail ||
                            order.items?.[0]?.product?.images?.[0] ||
                            "/images/product-placeholder.png"

                        return (
                            <OrderCard
                                key={order.id}
                                order={{
                                    id: order.id,
                                    status: normalizedStatus,
                                    date: order.createdAt
                                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "2-digit",
                                            year: "numeric",
                                        })
                                        : "-",
                                    total: `Rs ${totalValue.toLocaleString("en-IN")}`,
                                    items: order.items?.length ?? 0,
                                    image,
                                    paymentMethod: order.paymentMethod,
                                    paymentStatus: order.paymentStatus,
                                    refundStatus: order.refundStatus,
                                }}
                                index={index}
                                onReorder={handleReorder}
                            />
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}
