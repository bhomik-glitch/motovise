"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { User, Mail, ShieldCheck } from "lucide-react"

export function ProfileHeader({ user }: { user?: any }) {
    return (
        <Card className="border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                    Update your personal details and how others see you.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 transition-all duration-300 group-hover:ring-primary/20">
                            {user?.image ? (
                                <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-primary/5 flex items-center justify-center text-primary text-2xl font-bold">
                                    {user?.name?.[0]?.toUpperCase() || <User size={40} />}
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 shadow-lg border rounded-full p-1.5 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Update profile picture">
                            <User size={14} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Profile Picture</h4>
                        <p className="text-sm text-muted-foreground">
                            Click the avatar to upload a new one. Supports JPG, PNG.
                        </p>
                        <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs">Upload New</Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/5">Remove</Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input id="name" defaultValue={user?.name || ""} className="pl-10" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input id="email" defaultValue={user?.email || ""} className="pl-10" disabled aria-disabled="true" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 leading-none">
                            <ShieldCheck size={10} className="text-green-500" /> Primary email address verified
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button>Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    )
}
