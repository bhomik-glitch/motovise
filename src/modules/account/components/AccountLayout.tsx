"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { AccountSidebar } from "@/components/account/AccountSidebar"

export function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="container mx-auto px-0 md:px-4 pt-32 pb-8 md:pt-40 md:pb-12">
            <div className="flex flex-col md:flex-row gap-0 md:gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 border-b md:border-0 bg-white dark:bg-slate-950 md:bg-transparent sticky top-[100px] md:static z-20">
                    <AccountSidebar />
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-4 md:p-0">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
