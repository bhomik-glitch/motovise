"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/Badge"
import { ProfileHeader } from "@/components/account/ProfileHeader"
import { SecurityPanel } from "@/components/account/SecurityPanel"
import { PageSkeleton } from "@/components/ui/PageSkeleton"

export function AccountDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()

    React.useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    if (status === "loading" || status === "unauthenticated") {
        return <PageSkeleton />
    }

    const user = session?.user

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <Badge variant="outline" className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
                    Standard Account
                </Badge>
            </div>

            <div className="grid gap-6">
                <ProfileHeader user={user} />
                <SecurityPanel />
            </div>
        </div>
    )
}
