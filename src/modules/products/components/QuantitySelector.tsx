"use client";

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuantitySelectorProps {
    quantity: number;
    maxQuantity: number;
    onChange: (q: number) => void;
}

export function QuantitySelector({ quantity, maxQuantity, onChange }: QuantitySelectorProps) {
    const handleDecrement = () => {
        if (quantity > 1) onChange(quantity - 1);
    };

    const handleIncrement = () => {
        if (quantity < maxQuantity) onChange(quantity + 1);
    };

    return (
        <div className="flex items-center rounded-xl border border-input p-1 w-fit bg-background">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <span className="flex w-12 items-center justify-center text-sm font-semibold tabular-nums text-foreground">
                {quantity}
            </span>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={handleIncrement}
                disabled={quantity >= maxQuantity}
                aria-label="Increase quantity"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
