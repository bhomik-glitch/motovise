"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/Badge"
import { OrderCard, OrderItem } from "@/components/account/OrderCard"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { SectionSkeleton } from "@/components/ui/PageSkeleton"
import { Button } from "@/components/ui/Button"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"

// Mock orders for testing pagination
const mockOrders: OrderItem[] = Array.from({ length: 24 }).map((_, i) => ({
    id: `ORD-${10000 + i}-X${i}`,
    date: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
    total: `$${(124.50 - i * 2.5).toFixed(2)}`,
    status: i === 0 ? "Processing" : i < 3 ? "Shipped" : i % 8 === 0 ? "Cancelled" : "Delivered",
    items: Math.floor(Math.random() * 3) + 1,
    image: `https://images.unsplash.com/photo-${1523275335684 + i}?w=100&h=100&fit=crop`,
    paymentMethod: i % 3 === 0 ? "Cash on Delivery" : "Credit Card",
    paymentStatus: i % 8 === 0 ? "Refunded" : "Paid",
    refundStatus: i % 8 === 0 ? "Processed" : undefined
}));

export function OrdersList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Pagination state
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const [isLoading, setIsLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(pageParam ? parseInt(pageParam) : 1);
    const limit = limitParam ? parseInt(limitParam) : 5;

    const totalPages = Math.ceil(mockOrders.length / limit);
    const currentOrders = mockOrders.slice((currentPage - 1) * limit, currentPage * limit);

    // Simulate network delay for skeletons
    React.useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [currentPage, limit]);

    // Handle pagination click
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", newPage.toString());
            router.push(`${pathname}?${params.toString()}`, { scroll: true });
        }
    };

    const handleReorder = (orderId: string) => {
        // Mock reorder functionality
        console.log("Reordering:", orderId)
        router.push("/cart")
    }

    if (!isLoading && currentOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-400">
                    <ShoppingCart size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">No Orders</h3>
                <p className="text-slate-500 mb-6 max-w-sm">You haven&apos;t placed any orders yet. Start exploring our collections to find something you&apos;ll love.</p>
                <Button onClick={() => router.push("/products")}>Explore products</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                {!isLoading && (
                    <Badge variant="secondary" className="px-2 py-0.5 shadow-sm">
                        {mockOrders.length} total orders
                    </Badge>
                )}
            </div>

            <div className="grid gap-4 min-h-[400px]">
                {isLoading ? (
                    <SectionSkeleton />
                ) : (
                    <AnimatePresence mode="wait">
                        {currentOrders.map((order, index) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                index={index}
                                onReorder={handleReorder}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-6 mt-6">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        Showing <span className="font-medium text-foreground">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * limit, mockOrders.length)}</span> of <span className="font-medium text-foreground">{mockOrders.length}</span> orders
                    </p>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="gap-1"
                        >
                            <ChevronLeft size={16} /> Previous
                        </Button>
                        <div className="flex items-center gap-1 sm:hidden text-sm font-medium">
                            {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="gap-1"
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
