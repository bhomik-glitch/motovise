import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProductStatusBadge } from './ProductStatusBadge';
import { StockUpdateModal } from './StockUpdateModal';
import { useToggleProductStatus } from '../hooks/useToggleProductStatus';
import { useUpdateStock } from '../hooks/useUpdateProduct';
import type { Product } from '@/modules/admin/products/products.types';
import { cn } from '@/lib/utils';
import { Edit2, Power, Layers } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductTableProps {
    products: Product[];
    isLoading: boolean;
    onEdit: (product: Product) => void;
}

interface StockCellProps {
    product: Product;
    canUpdateStock: boolean;
}

interface ProductRowProps {
    product: Product;
    onEdit: () => void;
    canUpdate: boolean;
    canActivate: boolean;
    canUpdateStock: boolean;
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function ProductTable({ products, isLoading, onEdit }: ProductTableProps) {
    const { hasPermission } = useAuth();

    return (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                    {isLoading ? (
                        <SkeletonRows />
                    ) : products.length === 0 ? (
                        <EmptyRow />
                    ) : (
                        products.map((product) => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                onEdit={() => onEdit(product)}
                                canUpdate={hasPermission('product.update')}
                                canActivate={hasPermission('product.activate')}
                                canUpdateStock={hasPermission('product.stock.update')}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <div
                                className="h-4 bg-gray-200 rounded animate-pulse"
                                style={{ width: `${60 + ((i + j) * 17) % 30}%` }}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyRow() {
    return (
        <tr>
            <td colSpan={8} className="px-4 py-14 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Layers size={32} className="opacity-40" />
                    <span className="text-sm font-medium">No products found</span>
                    <span className="text-xs">Try adjusting your filters or create the first product.</span>
                </div>
            </td>
        </tr>
    );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({ product, onEdit, canUpdate, canActivate, canUpdateStock }: ProductRowProps) {
    const isInactive = product.status === 'INACTIVE';
    const { mutate: toggleStatus, isPending: isToggling } = useToggleProductStatus();

    return (
        <tr
            className={cn(
                'transition-colors',
                isInactive
                    ? 'opacity-60 bg-gray-50 hover:bg-gray-100'
                    : 'hover:bg-gray-50'
            )}
        >
            <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">
                {product.name}
            </td>
            <td className="px-4 py-3 text-gray-500 font-mono text-xs max-w-[140px] truncate">
                {product.slug}
            </td>
            <td className="px-4 py-3 text-gray-600">
                {product.category?.name ?? '—'}
            </td>
            <td className="px-4 py-3 font-medium text-gray-900">
                ₹{Number(product.price).toFixed(2)}
            </td>
            <td className="px-4 py-3">
                <StockCell product={product} canUpdateStock={canUpdateStock} />
            </td>
            <td className="px-4 py-3">
                <ProductStatusBadge status={product.status} />
            </td>
            <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(product.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })}
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                    {canUpdate && (
                        <button
                            onClick={onEdit}
                            className="p-1.5 rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                            title="Edit product"
                        >
                            <Edit2 size={15} />
                        </button>
                    )}
                    {canActivate && (
                        <button
                            onClick={() =>
                                toggleStatus({ id: product.id, currentStatus: product.status })
                            }
                            disabled={isToggling}
                            className={cn(
                                'p-1.5 rounded-md transition-colors disabled:opacity-40',
                                isInactive
                                    ? 'text-green-500 hover:text-green-700 hover:bg-green-50'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            )}
                            title={isInactive ? 'Activate product' : 'Deactivate product'}
                        >
                            <Power size={15} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

// ─── Stock Cell ───────────────────────────────────────────────────────────────

function StockCell({ product, canUpdateStock }: StockCellProps) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        'font-semibold tabular-nums',
                        product.stock === 0 ? 'text-red-600' : 'text-gray-900'
                    )}
                >
                    {product.stock}
                </span>
                {canUpdateStock && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="p-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors"
                        title="Update stock"
                    >
                        <Layers size={13} />
                    </button>
                )}
            </div>

            <StockUpdateModal
                productId={product.id}
                currentStock={product.stock}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
}
