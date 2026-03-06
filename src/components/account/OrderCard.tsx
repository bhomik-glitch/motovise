"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { CheckCircle2, Clock, Truck, Package, CreditCard, RefreshCcw, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"

export interface OrderItem {
    id: string;
    date: string;
    total: string;
    status: "Delivered" | "Processing" | "Shipped" | "Cancelled";
    items: number;
    image: string;
    paymentMethod?: string;
    paymentStatus?: string;
    refundStatus?: string;
}

const statusConfig = {
    Delivered: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    Processing: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    Shipped: { icon: Truck, color: "text-purple-500", bg: "bg-purple-500/10" },
    Cancelled: { icon: Package, color: "text-red-500", bg: "bg-red-500/10" },
}

export function OrderCard({ order, index = 0, onReorder }: { order: OrderItem, index?: number, onReorder?: (orderId: string) => void }) {
    const StatusIcon = statusConfig[order.status].icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:ring-primary/20 transition-all duration-300 group">
                <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                                    <p className="font-mono text-sm font-semibold">{order.id}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", statusConfig[order.status].bg, statusConfig[order.status].color)}>
                                        <StatusIcon size={14} />
                                        {order.status}
                                    </div>
                                    {order.paymentMethod && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {order.paymentMethod === 'Cash on Delivery' ? <Banknote size={14} /> : <CreditCard size={14} />}
                                            {order.paymentMethod}
                                        </div>
                                    )}
                                    {order.refundStatus && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 border border-orange-500/20">
                                            Refund {order.refundStatus}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 relative">
                                    <Image
                                        src={order.image}
                                        alt="Product Image"
                                        fill
                                        className="object-cover object-center"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Placed on {order.date}</p>
                                    <p className="text-xs text-muted-foreground">{order.items} {order.items > 1 ? 'items' : 'item'} • Total: <span className="font-semibold text-foreground">{order.total}</span></p>
                                    {order.paymentStatus && <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{order.paymentStatus}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t sm:border-t-0 sm:border-l flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-3">
                            <Button asChild variant="outline" size="sm" className="w-full sm:w-28 text-xs h-8">
                                <Link href={`/account/orders/${order.id}`}>View Detail</Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full sm:w-28 text-xs h-8 group overflow-hidden relative" onClick={() => onReorder?.(order.id)}>
                                <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative flex items-center justify-center gap-1.5 font-medium group-hover:text-primary transition-colors">
                                    <RefreshCcw size={14} />
                                    Reorder
                                </span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
