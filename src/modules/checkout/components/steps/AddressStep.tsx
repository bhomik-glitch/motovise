"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { MapPin, Plus, Check, Loader2, Home, Briefcase, AlertCircle, X } from "lucide-react";
import { addressService } from "@/modules/account/services/addressService";
import { Address, CreateAddressInput } from "@/types/address";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface AddressStepProps {
    selectedAddressId: string | null;
    onSelect: (addressId: string) => void;
    onNext: () => void;
}

function AddressForm({ onSubmit, onCancel, isSubmitting }: {
    onSubmit: (data: CreateAddressInput) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState<CreateAddressInput>({
        type: "Home",
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
        isDefault: false,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof CreateAddressInput, string>>>({});

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!form.name.trim()) newErrors.name = "Full name is required";
        if (!form.street.trim()) newErrors.street = "Street address is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.state.trim()) newErrors.state = "State is required";
        if (!form.zip.trim()) newErrors.zip = "PIN code is required";
        else if (!/^\d{6}$/.test(form.zip)) newErrors.zip = "PIN code must be 6 digits";
        if (form.phone && !/^\+?[\d\s-]{10,}$/.test(form.phone)) newErrors.phone = "Invalid phone number";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
    };

    const field = (
        key: keyof CreateAddressInput,
        label: string,
        placeholder: string,
        required = true,
        type = "text"
    ) => (
        <div className="space-y-1.5">
            <label htmlFor={`addr-${key}`} className="text-xs font-medium text-muted-foreground">
                {label}{required && <span className="text-destructive ml-0.5">*</span>}
            </label>
            <Input
                id={`addr-${key}`}
                type={type}
                placeholder={placeholder}
                value={(form[key] as string) ?? ""}
                onChange={(e) => {
                    setForm((f) => ({ ...f, [key]: e.target.value }));
                    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
                }}
                className={cn(errors[key] && "border-destructive focus-visible:ring-destructive")}
                aria-describedby={errors[key] ? `addr-${key}-error` : undefined}
                aria-invalid={!!errors[key]}
            />
            <AnimatePresence>
                {errors[key] && (
                    <motion.p
                        id={`addr-${key}-error`}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-destructive flex items-center gap-1"
                        role="alert"
                    >
                        <AlertCircle size={11} /> {errors[key]}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onSubmit={handleSubmit}
            className="space-y-4 p-5 rounded-xl border border-primary/20 bg-primary/[0.02]"
            noValidate
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">New Delivery Address</h3>
                <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={16} />
                </button>
            </div>

            {/* Address type */}
            <div className="flex gap-2">
                {["Home", "Work", "Other"].map((t) => (
                    <button
                        type="button"
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                            form.type === t
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                    >
                        {t === "Home" ? <Home size={12} /> : t === "Work" ? <Briefcase size={12} /> : <MapPin size={12} />}
                        {t}
                    </button>
                ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {field("name", "Full Name", "John Doe")}
                {field("phone", "Phone Number", "+91 98765 43210", false, "tel")}
            </div>
            {field("street", "Street Address", "123 MG Road, Apt 4B")}
            <div className="grid sm:grid-cols-3 gap-4">
                {field("city", "City", "Mumbai")}
                {field("state", "State", "Maharashtra")}
                {field("zip", "PIN Code", "400001")}
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="addr-isDefault"
                    type="checkbox"
                    checked={!!form.isDefault}
                    onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="addr-isDefault" className="text-xs text-muted-foreground cursor-pointer">
                    Set as default address
                </label>
            </div>

            <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1 gap-2">
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Save Address
                </Button>
            </div>
        </motion.form>
    );
}

function AddressCard({
    address,
    isSelected,
    onSelect,
}: {
    address: Address;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <motion.button
            type="button"
            onClick={onSelect}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative",
                isSelected
                    ? "border-primary bg-primary/[0.03]"
                    : "border-border hover:border-primary/40"
            )}
            aria-pressed={isSelected}
        >
            {isSelected && (
                <motion.div
                    layoutId="selected-check"
                    className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <Check size={12} className="text-primary-foreground" strokeWidth={3} />
                </motion.div>
            )}
            <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded-md", isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    <MapPin size={14} />
                </div>
                <span className="text-sm font-semibold">{address.type}</span>
                {address.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Default</span>
                )}
            </div>
            <p className="text-sm font-medium">{address.name}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {address.street}, {address.city}, {address.state} – {address.zip}
            </p>
            {address.phone && <p className="text-xs text-muted-foreground mt-0.5">{address.phone}</p>}
        </motion.button>
    );
}

export function AddressStep({ selectedAddressId, onSelect, onNext }: AddressStepProps) {
    const [showForm, setShowForm] = useState(false);
    const queryClient = useQueryClient();

    const { status } = useSession();

    const { data: addresses, isLoading } = useQuery({
        queryKey: ["addresses"],
        queryFn: addressService.getAddresses,
        enabled: status === 'authenticated',
    });

    const createMutation = useMutation({
        mutationFn: addressService.createAddress,
        onSuccess: (newAddress) => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            onSelect(newAddress.id);
            setShowForm(false);
        },
    });

    // Auto-select default address
    useEffect(() => {
        if (!selectedAddressId && addresses?.length) {
            const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
            if (defaultAddr) onSelect(defaultAddr.id);
        }
    }, [selectedAddressId, addresses, onSelect]);

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Delivery Address</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose where you&apos;d like your order delivered.</p>
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-3">
                    {[0, 1].map((i) => (
                        <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                    <AnimatePresence>
                        {addresses?.map((address, i) => (
                            <motion.div
                                key={address.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <AddressCard
                                    address={address}
                                    isSelected={selectedAddressId === address.id}
                                    onSelect={() => onSelect(address.id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence mode="wait">
                {showForm ? (
                    <AddressForm
                        key="form"
                        onSubmit={(data) => createMutation.mutate(data)}
                        onCancel={() => setShowForm(false)}
                        isSubmitting={createMutation.isPending}
                    />
                ) : (
                    <motion.button
                        key="add-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 text-sm text-primary font-medium hover:underline underline-offset-4 transition-all"
                    >
                        <Plus size={16} /> Add new address
                    </motion.button>
                )}
            </AnimatePresence>

            <div className="pt-4">
                <Button
                    onClick={onNext}
                    disabled={!selectedAddressId}
                    size="lg"
                    className="w-full sm:w-auto sm:min-w-[180px] min-h-[48px] text-base gap-2 font-semibold"
                >
                    Continue to Shipping
                </Button>
            </div>
        </div>
    );
}
