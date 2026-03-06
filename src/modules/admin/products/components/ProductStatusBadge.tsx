import React from 'react';
import { cn } from '@/lib/utils';
import type { ProductStatus } from '@/modules/admin/products/products.types';

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
    const isInactive = status === 'INACTIVE';

    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold',
                isInactive
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-green-100 text-green-800'
            )}
        >
            {status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
    );
}
