import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CategorySelect } from './CategorySelect';
import type { Product } from '@/modules/admin/products/products.types';
import { useCreateProduct } from '../hooks/useCreateProduct';
import { useUpdateProduct } from '../hooks/useUpdateProduct';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required').regex(slugRegex, 'Invalid slug format (e.g. valid-slug-123)'),
    description: z.string().min(1, 'Description is required'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    categoryId: z.string().min(1, 'Category is required'),
    stock: z.coerce.number().min(0, 'Stock cannot be negative').optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
    const isEditing = !!product;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

    useEffect(() => {
        if (isOpen) {
            if (product) {
                reset({
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    price: product.price,
                    categoryId: product.categoryId || product.category?.id || '',
                });
            } else {
                reset({
                    name: '',
                    slug: '',
                    description: '',
                    price: '' as any,
                    stock: '' as any,
                    categoryId: '',
                });
            }
        }
    }, [isOpen, product, reset]);

    const onSubmit = (data: ProductFormData) => {
        if (isEditing) {
            // Stock handled separately during update
            const { stock, ...updateData } = data;
            updateProduct(
                { id: product.id, data: updateData },
                {
                    onSuccess: () => onClose(),
                }
            );
        } else {
            createProduct(
                { ...data, stock: data.stock ?? 0 },
                {
                    onSuccess: () => onClose(),
                }
            );
        }
    };

    const isPending = isCreating || isUpdating;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl shrink-0 my-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('name')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="e.g. Classic T-Shirt"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slug <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('slug')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="e.g. classic-t-shirt"
                        />
                        {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="Product details..."
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('price')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                placeholder="0.00"
                            />
                            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
                        </div>

                        {!isEditing && (
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Initial Stock <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('stock')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                    placeholder="0"
                                />
                                {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock.message}</p>}
                            </div>
                        )}
                    </div>

                    <div>
                        <Controller
                            control={control}
                            name="categoryId"
                            render={({ field }) => (
                                <div className="relative">
                                    <CategorySelect
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.categoryId?.message}
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                            disabled={isPending}
                        >
                            {isPending ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
