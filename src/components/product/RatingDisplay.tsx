"use client"

import * as React from "react"
import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingDisplayProps {
    rating: number;
    count?: number;
    className?: string;
    size?: number;
}

export function RatingDisplay({ rating, count, className, size = 16 }: RatingDisplayProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex" aria-label={`Rating: ${rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => {
                    if (i < fullStars) {
                        return <Star key={i} size={size} className="fill-amber-400 text-amber-400" />
                    } else if (i === fullStars && hasHalfStar) {
                        return <StarHalf key={i} size={size} className="fill-amber-400 text-amber-400" />
                    } else {
                        return <Star key={i} size={size} className="fill-transparent text-slate-200 dark:text-slate-800" />
                    }
                })}
            </div>
            {count !== undefined && (
                <a href="#reviews" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline">
                    {rating.toFixed(1)} ({count} reviews)
                </a>
            )}
        </div>
    )
}
