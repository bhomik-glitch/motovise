"use client";

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductTabsProps {
    product: Product;
}

type TabKey = 'overview' | 'specs' | 'reviews' | 'shipping';

const tabs: { id: TabKey; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'shipping', label: 'Shipping & Returns' },
];

export function ProductTabs({ product }: ProductTabsProps) {
    const [activeTab, setActiveTab] = React.useState<TabKey>('overview');

    return (
        <div className="mt-16 w-full lg:mt-24">
            {/* Tab Navigation */}
            <div className="flex space-x-8 border-b border-border overflow-x-auto no-scrollbar pb-px">
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
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="py-8 min-h-[300px]">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
                            <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    {activeTab === 'specs' && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                                <div key={key} className="flex flex-col space-y-1 rounded-xl bg-muted/50 p-4">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {key}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {String(value)}
                                    </span>
                                </div>
                            ))}
                            {(!product.attributes || Object.keys(product.attributes).length === 0) && (
                                <p className="text-muted-foreground">No specific attributes found.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="text-muted-foreground">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Customer Reviews</h3>
                            <p>Reviews functionality will be implemented in a future update. For now, this product has been rated highly by our initial beta testers.</p>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="text-muted-foreground prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Shipping Policy</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Free Standard Shipping:</strong> 3-5 business days for domestic orders over $50.</li>
                                <li><strong>Express Shipping:</strong> 1-2 business days for $15.</li>
                                <li><strong>International Delivery:</strong> Available to 100+ countries. Delivery times vary by location.</li>
                            </ul>
                            <h3 className="mt-8 mb-4 text-lg font-semibold text-foreground">Return Policy</h3>
                            <p>We accept returns within 30 days of the original purchase date. Items must be in their original condition and packaging. Please contact support to initiate a return.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
