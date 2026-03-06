"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export function SecurityPanel() {
    return (
        <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                    Manage your password and security settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">Password</p>
                        <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                    </div>
                    <Button variant="outline" size="sm">Update Password</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border opacity-70">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Coming Soon
                        </p>
                    </div>
                    <Button variant="outline" size="sm" disabled aria-disabled="true">Setup 2FA</Button>
                </div>
            </CardContent>
        </Card>
    )
}
