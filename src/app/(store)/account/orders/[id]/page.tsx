"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, Package, CreditCard, MapPin, ExternalLink, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { OrderTimeline, OrderTimelineStatus } from '@/components/account/OrderTimeline'
import { formatPrice } from '@/lib/utils'

// Mock fetching order detail
const mockOrder = {
    id: "ORD-10000-X0",
    date: "March 02, 2026",
    status: "Shipped" as OrderTimelineStatus,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    totalAmount: 124.50,
    subtotal: 110.00,
    shippingFee: 14.50,
    items: [
        {
            id: "1",
            name: "Premium Wireless Headphones",
            price: 80.00,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop"
        },
        {
            id: "2",
            name: "Ergonomic Mousepad",
            price: 30.00,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop"
        }
    ],
    shipping: {
        recipient: "John Doe",
        address: "123 Main St, Apartment 4B",
        city: "Mumbai",
        state: "MH",
        pincode: "400001",
        phone: "9876543210"
    },
    tracking: {
        carrier: "BlueDart",
        trackingId: "BD987654321IN",
        estimatedDelivery: "March 05, 2026"
    }
}

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    const handleReorder = () => {
        // Mock reorder
        console.log("Reordering items:", mockOrder.items)
        router.push('/cart')
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-2 w-fit group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Orders
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Order {mockOrder.id}</h1>
                    <p className="text-sm text-muted-foreground mt-1">Placed on {mockOrder.date}</p>
                </div>
                <Button onClick={handleReorder} className="gap-2 focus-visible:ring-2 focus-visible:ring-primary w-full sm:w-auto">
                    <RefreshCcw size={16} /> Reorder
                </Button>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader>
                    <CardTitle>Shipment Tracking</CardTitle>
                    <CardDescription>
                        Via {mockOrder.tracking.carrier} • Tracking #{mockOrder.tracking.trackingId}
                        <Link href="#" className="inline-flex items-center text-primary ml-2 hover:underline">
                            Track <ExternalLink size={12} className="ml-1" />
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OrderTimeline currentStatus={mockOrder.status} />
                    <div className="mt-8 p-4 bg-primary/5 rounded-lg text-sm text-center font-medium text-primary">
                        Estimated Delivery: {mockOrder.tracking.estimatedDelivery}
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package size={18} className="text-muted-foreground" />
                                Items Purchased
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {mockOrder.items.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="h-20 w-20 sm:h-24 sm:w-24 relative flex-shrink-0 overflow-hidden rounded-lg border bg-slate-50">
                                        <Image src={item.image} alt={item.name} fill className="object-cover object-center" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between py-1">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
                                            <div>
                                                <h3 className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold mt-2 sm:mt-0">{formatPrice(item.price)}</p>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground flex justify-end">
                                            Line Total: <span className="text-foreground ml-1">{formatPrice(item.price * item.quantity)}</span>
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard size={18} className="text-muted-foreground" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(mockOrder.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatPrice(mockOrder.shippingFee)}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>{formatPrice(mockOrder.totalAmount)}</span>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                                    <span>Status</span>
                                    <span className="text-green-600 font-medium">Paid via {mockOrder.paymentMethod}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin size={18} className="text-muted-foreground" />
                                Shipping Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p className="font-medium">{mockOrder.shipping.recipient}</p>
                            <p className="text-muted-foreground">{mockOrder.shipping.address}</p>
                            <p className="text-muted-foreground">{mockOrder.shipping.city}, {mockOrder.shipping.state} {mockOrder.shipping.pincode}</p>
                            <p className="text-muted-foreground pt-2">Phone: {mockOrder.shipping.phone}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
