"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { MapPin, MoreVertical, Trash2, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AddressItem {
    id: string;
    type: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
    isDefault: boolean;
}

interface AddressCardProps {
    address: AddressItem;
    index?: number;
    onEdit?: (address: AddressItem) => void;
    onRemove?: (id: string) => void;
    onSetDefault?: (id: string) => void;
}

export function AddressCard({ address, index = 0, onEdit, onRemove, onSetDefault }: AddressCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
        >
            <Card className={cn(
                "relative h-full flex flex-col border-0 shadow-sm ring-1 transition-all duration-300",
                address.isDefault ? "ring-primary/40 bg-primary/[0.02]" : "ring-black/5 dark:ring-white/10 hover:ring-primary/20 hover:-translate-y-1"
            )}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "p-1.5 rounded-lg",
                            address.isDefault ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}>
                            <MapPin size={16} />
                        </div>
                        <CardTitle className="text-sm font-semibold">{address.type}</CardTitle>
                        {address.isDefault && (
                            <Badge variant="outline" className="text-[10px] py-0 h-4 border-primary/20 text-primary bg-primary/5">Default</Badge>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                        <MoreVertical size={16} />
                        <span className="sr-only">More options</span>
                    </Button>
                </CardHeader>
                <CardContent className="pb-4 space-y-2 flex-grow">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">{address.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {address.street}<br />
                            {address.city}, {address.state} {address.zip}
                        </p>
                        {address.phone && (
                            <p className="text-xs text-muted-foreground mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                                Phone: {address.phone}
                            </p>
                        )}
                    </div>
                </CardContent>
                <div className="p-4 pt-0 flex gap-2 border-t border-slate-100 dark:border-slate-800 mt-auto px-4 pt-4">
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary" onClick={() => onEdit?.(address)}>
                        <Edit3 size={12} /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive" onClick={() => onRemove?.(address.id)}>
                        <Trash2 size={12} /> Remove
                    </Button>
                    {!address.isDefault && (
                        <Button variant="ghost" size="sm" className="h-7 text-[11px] ml-auto hover:text-primary focus-visible:ring-2 focus-visible:ring-primary" onClick={() => onSetDefault?.(address.id)}>
                            Set as Default
                        </Button>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}
