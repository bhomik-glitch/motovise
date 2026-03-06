"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Plus, MapPin } from "lucide-react"
import { AddressCard, AddressItem } from "@/components/account/AddressCard"
import { AddressForm } from "@/components/account/AddressForm"
import { SectionSkeleton } from "@/components/ui/PageSkeleton"

const initialAddresses: AddressItem[] = [
    {
        id: "1",
        type: "Home",
        name: "John Doe",
        street: "123 Main St, Apartment 4B",
        city: "Mumbai",
        state: "MH",
        zip: "400001",
        phone: "9876543210",
        isDefault: true,
    },
    {
        id: "2",
        type: "Work",
        name: "John Doe",
        street: "500 Business Ave, Suite 200",
        city: "Bengaluru",
        state: "KA",
        zip: "560001",
        phone: "9123456780",
        isDefault: false,
    },
]

export function AddressManager() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAdding, setIsAdding] = React.useState(false);
    const [addresses, setAddresses] = React.useState<AddressItem[]>([]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setAddresses(initialAddresses);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleRemove = (id: string) => {
        setAddresses(prev => prev.filter(a => a.id !== id));
    };

    const handleSetDefault = (id: string) => {
        setAddresses(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === id
        })));
    };

    const handleSuccess = () => {
        setIsAdding(false);
        // Would normally re-fetch or optimistically update UI here.
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Saved Addresses</h1>
                {!isLoading && addresses.length > 0 && !isAdding && (
                    <Button size="sm" className="h-8 gap-1.5 px-3" onClick={() => setIsAdding(true)}>
                        <Plus size={16} />
                        Add Address
                    </Button>
                )}
            </div>

            {isAdding ? (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AddressForm onSuccess={handleSuccess} onCancel={() => setIsAdding(false)} />
                </motion.div>
            ) : isLoading ? (
                <SectionSkeleton className="grid grid-cols-1 sm:grid-cols-2 gap-6" />
            ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-400">
                        <MapPin size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Addresses Found</h3>
                    <p className="text-slate-500 mb-6 max-w-sm">You haven&apos;t added any shipping or billing addresses yet.</p>
                    <Button className="gap-2" onClick={() => setIsAdding(true)}><Plus size={16} /> Add Address</Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 min-h-[400px]">
                    <AnimatePresence>
                        {addresses.map((address, index) => (
                            <div key={address.id} className="h-full">
                                <AddressCard
                                    address={address}
                                    index={index}
                                    onRemove={handleRemove}
                                    onSetDefault={handleSetDefault}
                                    onEdit={() => setIsAdding(true)}
                                />
                            </div>
                        ))}
                    </AnimatePresence>

                    <motion.button
                        onClick={() => setIsAdding(true)}
                        whileHover={{ scale: 0.99 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-300 active:bg-primary/5 group h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Add a new address"
                    >
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Plus size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">Add New Address</p>
                            <p className="text-xs text-muted-foreground">Add a different shipping or billing address</p>
                        </div>
                    </motion.button>
                </div>
            )}
        </div>
    )
}
