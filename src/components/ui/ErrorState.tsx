import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We encountered an error loading this data. Please try again.",
    onRetry,
    className
}: ErrorStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/50 ${className || ''}`}
        >
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500 mb-4">
                <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                {message}
            </p>
            {onRetry && (
                <Button
                    onClick={onRetry}
                    variant="outline"
                    className="gap-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-500"
                >
                    <RefreshCw size={16} />
                    Try Again
                </Button>
            )}
        </motion.div>
    );
}
