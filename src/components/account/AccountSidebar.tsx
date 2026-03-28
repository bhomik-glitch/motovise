"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { User, ShoppingBag, MapPin, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/Card"
import { signOut, useSession } from "next-auth/react"

const sidebarItems = [
    { name: "Profile", href: "/account", icon: User },
    { name: "Orders", href: "/account/orders", icon: ShoppingBag },
    { name: "Addresses", href: "/account/address", icon: MapPin },
]

export function AccountSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    return (
        <div className="w-full bg-white dark:bg-slate-950 sticky top-16 md:static z-20 md:z-auto border-b md:border-none">
            <nav className="max-w-7xl mx-auto flex md:flex-col items-center md:items-stretch gap-2 overflow-x-auto no-scrollbar px-4 md:px-0 py-2 md:py-0" aria-label="Account navigation">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                isActive
                                    ? "bg-blue-50 text-blue-600 md:bg-primary/10 md:text-primary"
                                    : "text-muted-foreground hover:bg-accent/50 text-gray-600"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon
                                className={cn(
                                    "mr-2 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-blue-600 md:text-primary" : "text-gray-400 group-hover:text-gray-500"
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    )
                })}
                {session && (
                    <>
                        <div className="hidden md:block my-2 h-px bg-slate-100 dark:bg-slate-800" role="separator" />
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="group flex items-center px-4 py-2 text-sm font-medium rounded-full text-destructive hover:bg-destructive/10 transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive ml-auto md:ml-0"
                            aria-label="Sign Out"
                        >
                            <LogOut
                                className="mr-2 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-destructive/70 group-hover:text-destructive"
                                aria-hidden="true"
                            />
                            Sign Out
                        </button>
                    </>
                )}
            </nav>
        </div>
    )
}
