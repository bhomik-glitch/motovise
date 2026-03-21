"use client";

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import {
    Cpu, Wifi, Monitor, Youtube, Signal, Bluetooth, Music,
    MapPin, Package, Zap, Plug, Shield, Volume2, RefreshCw,
    Minimize2, Thermometer, CheckCircle2,
} from 'lucide-react';

interface ProductTabsProps {
    product: Product;
}

type TabKey = 'overview' | 'specs' | 'compatibility' | 'inbox' | 'shipping';

// Map icon name strings (stored in DB) to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
    Cpu, Wifi, Monitor, Youtube, Signal, Bluetooth, Music,
    MapPin, Package, Zap, Plug, Shield, Volume2, RefreshCw,
    Minimize2, Thermometer, CheckCircle2,
};

function FeatureIcon({ name }: { name?: string }) {
    const Icon = name && ICON_MAP[name] ? ICON_MAP[name] : CheckCircle2;
    return <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />;
}

export function ProductTabs({ product }: ProductTabsProps) {
    const [activeTab, setActiveTab] = React.useState<TabKey>('overview');

    const hasFeatures = product.features && product.features.length > 0;
    const hasSpecs = product.specifications && product.specifications.length > 0;
    const hasCompatibility = product.compatibility &&
        ((product.compatibility.makes && product.compatibility.makes.length > 0) ||
            product.compatibility.note);
    const hasBoxContents = product.boxContents && product.boxContents.length > 0;

    const tabs: { id: TabKey; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        ...(hasSpecs ? [{ id: 'specs' as TabKey, label: 'Specifications' }] : []),
        ...(hasCompatibility ? [{ id: 'compatibility' as TabKey, label: 'Compatibility' }] : []),
        ...(hasBoxContents ? [{ id: 'inbox' as TabKey, label: "In the Box" }] : []),
        { id: 'shipping', label: 'Shipping & Returns' },
    ];

    return (
        <div className="mt-12 w-full">
            {/* Tab Navigation */}
            <div className="flex space-x-8 border-b border-border overflow-x-auto pb-px">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative pb-4 text-sm font-medium transition-colors hover:text-foreground whitespace-nowrap outline-none",
                            activeTab === tab.id ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="py-8 min-h-[260px]">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    {/* ── OVERVIEW ─────────────────────────────────────────────── */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Full description */}
                            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
                                <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                            </div>

                            {/* Features grid */}
                            {hasFeatures && (
                                <div>
                                    <h3 className="mb-4 text-base font-semibold text-foreground">Key Features</h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {product.features!.map((feat, i) => (
                                            <div
                                                key={i}
                                                className="flex gap-3 rounded-xl bg-muted/40 p-4 ring-1 ring-border/50"
                                            >
                                                <FeatureIcon name={feat.icon} />
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{feat.title}</p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                                                        {feat.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── SPECIFICATIONS ────────────────────────────────────────── */}
                    {activeTab === 'specs' && (
                        <div>
                            {hasSpecs ? (
                                <table className="w-full text-sm">
                                    <tbody>
                                        {product.specifications!.map((spec, i) => (
                                            <tr
                                                key={i}
                                                className={cn(
                                                    "border-b border-border/50",
                                                    i % 2 === 0 ? "bg-muted/20" : "bg-transparent"
                                                )}
                                            >
                                                <td className="py-3 px-4 font-medium text-foreground w-40 align-top">
                                                    {spec.label}
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground">
                                                    {spec.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-muted-foreground">No specifications available.</p>
                            )}
                        </div>
                    )}

                    {/* ── COMPATIBILITY ────────────────────────────────────────── */}
                    {activeTab === 'compatibility' && (
                        <div className="space-y-6">
                            {product.compatibility?.years && (
                                <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-5 py-4 ring-1 ring-border/50">
                                    <span className="text-sm font-medium text-foreground">Year Range:</span>
                                    <span className="text-sm text-muted-foreground">
                                        {product.compatibility.years.from} – {product.compatibility.years.to}
                                    </span>
                                </div>
                            )}

                            {product.compatibility?.makes && product.compatibility.makes.length > 0 && (
                                <div>
                                    <h4 className="mb-3 text-sm font-semibold text-foreground">Compatible Makes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.compatibility.makes.map((make) => (
                                            <span
                                                key={make}
                                                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                                            >
                                                {make}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.compatibility?.note && (
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        <span className="font-semibold text-foreground">Note: </span>
                                        {product.compatibility.note}
                                    </p>
                                </div>
                            )}

                            {!hasCompatibility && (
                                <p className="text-muted-foreground">Compatible with a wide range of vehicles. Contact us for specific model support.</p>
                            )}
                        </div>
                    )}

                    {/* ── IN THE BOX ───────────────────────────────────────────── */}
                    {activeTab === 'inbox' && (
                        <div>
                            {hasBoxContents ? (
                                <ul className="space-y-2">
                                    {product.boxContents.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Box contents not listed.</p>
                            )}
                        </div>
                    )}

                    {/* ── SHIPPING & RETURNS ───────────────────────────────────── */}
                    {activeTab === 'shipping' && (
                        <div className="text-muted-foreground prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                            <h3 className="mb-3 text-base font-semibold text-foreground">Shipping Policy</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Free Standard Shipping:</strong> On all orders within India. Delivered in 3–7 business days.</li>
                                <li><strong>Express Shipping:</strong> Available at checkout for 1–3 business day delivery.</li>
                                <li><strong>Order Tracking:</strong> You will receive a tracking link via SMS/email once shipped.</li>
                            </ul>
                            <h3 className="mt-8 mb-3 text-base font-semibold text-foreground">Return Policy</h3>
                            <p>
                                We offer a <strong>7-day hassle-free return</strong> policy. If you are not satisfied with your purchase,
                                contact us within 7 days of delivery and we will arrange a pickup. Items must be in original condition and packaging.
                            </p>
                            <p className="mt-3">
                                For warranty claims, our products include a <strong>1-year warranty</strong> covering manufacturing defects.
                                Contact our support team to initiate a claim.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
