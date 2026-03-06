"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { User, ShoppingBag, MapPin, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/Card"
import { signOut } from "next-auth/react"

const sidebarItems = [
    { name: "Profile", href: "/account", icon: User },
    { name: "Orders", href: "/account/orders", icon: ShoppingBag },
    { name: "Addresses", href: "/account/address", icon: MapPin },
]

export function AccountSidebar() {
    const pathname = usePathname()

    return (
        <Card className="p-2 md:p-4 border-b md:border-0 shadow-sm md:ring-1 md:ring-black/5 dark:md:ring-white/10 md:rounded-xl rounded-none md:overflow-hidden bg-white dark:bg-slate-950 flex-shrink-0 z-10 sticky top-0 md:static">
            <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar md:overflow-visible pb-2 md:pb-0" aria-label="Account navigation">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center px-4 py-3 md:px-3 md:py-2 text-sm font-medium rounded-full md:rounded-lg transition-all duration-200 relative whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                isActive
                                    ? "text-primary bg-primary/5 md:bg-transparent"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 text-gray-600"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-sidebar"
                                    className="hidden md:block absolute inset-0 bg-primary/10 rounded-lg -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon
                                className={cn(
                                    "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    )
                })}
                <div className="hidden md:block my-2 h-px bg-slate-100 dark:bg-slate-800" role="separator" />
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="group flex items-center px-4 py-3 md:px-3 md:py-2 text-sm font-medium rounded-full md:rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                    aria-label="Sign Out"
                >
                    <LogOut
                        className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-destructive/70 group-hover:text-destructive"
                        aria-hidden="true"
                    />
                    Sign Out
                </button>
            </nav>
        </Card>
    )
}
