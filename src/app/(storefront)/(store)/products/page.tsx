"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import { useProducts, useCategories } from '@/modules/products/hooks/useProducts';
import { ProductCard, ProductCardSkeleton } from '@/modules/products/components/ProductCard';
import { ProductGrid } from '@/modules/products/components/ProductGrid';
import { FilterSidebar, FilterSidebarSkeleton, type FilterState } from '@/modules/products/components/FilterSidebar';
import { SortDropdown, type SortOption } from '@/modules/products/components/SortDropdown';
import { Pagination } from '@/modules/products/components/Pagination';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/modules/cart/hooks/useCart';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addItem } = useCart();
    const { status } = useSession();

    const handleAddToCart = (product: any) => {
        if (status !== 'authenticated') {
            router.push('/login');
            return;
        }
        addItem(
            { productId: product.id, quantity: 1 },
            {
                onSuccess: () => {
                    toast.success(`${product.name} added to cart!`);
                },
                onError: (error: unknown) => {
                    toast.error((error as any)?.message || 'Failed to add to cart');
                }
            }
        );
    };

    // Parse URL Params
    const queryPage = Number(searchParams.get('page')) || 1;
    const querySort = (searchParams.get('sort') as SortOption) || 'newest';
    const querySearch = searchParams.get('q') || undefined;
    const queryCategories = searchParams.get('categories') ? searchParams.get('categories')!.split(',') : [];
    const queryMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const queryMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

    // Local State
    const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
    const [page, setPage] = React.useState(queryPage);
    const [sort, setSort] = React.useState<SortOption>(querySort);
    const [searchQuery, setSearchQuery] = React.useState<string | undefined>(querySearch);
    const [filters, setFilters] = React.useState<FilterState>({
        categories: queryCategories,
        minPrice: queryMinPrice,
        maxPrice: queryMaxPrice,
    });

    // Update URL when state changes (debounced by React automatically in transitions or simple effects)
    React.useEffect(() => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        if (sort !== 'newest') params.set('sort', sort);
        if (searchQuery) params.set('q', searchQuery);
        if (filters.categories.length > 0) params.set('categories', filters.categories.join(','));
        if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());

        router.push(`/products?${params.toString()}`);
    }, [page, sort, filters, searchQuery, router]);

    // Fetch Data
    const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
    const { data: productsData, isLoading: isProductsLoading } = useProducts({
        page,
        sort,
        filters,
        search: searchQuery,
    });

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
            {/* Hero / Banner Area */}
            <section
                className="max-w-7xl mx-auto mb-8 overflow-hidden rounded-3xl lg:mb-12"
                style={{
                    backgroundImage: "url('/Motovise Imges/be9038ab-8b30-4321-873d-6eb2f72167c8.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '280px',
                }}
            />

            {/* Mobile Controls */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
                <Button variant="outline" onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
                <SortDropdown value={sort} onChange={(s) => { setSort(s); setPage(1); }} />
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                {/* Sidebar */}
                <aside
                    className={`lg:w-64 shrink-0 transition-all ${isMobileFilterOpen ? 'block' : 'hidden lg:block'
                        }`}
                >
                    <div className="sticky top-24">
                        <div className="mb-6 hidden items-center justify-between lg:flex">
                            <h2 className="text-xl font-bold tracking-tight">Filters</h2>
                        </div>
                        {isCategoriesLoading ? (
                            <FilterSidebarSkeleton />
                        ) : (
                            <FilterSidebar
                                availableCategories={categoriesData || []}
                                filters={filters}
                                onChange={(newFilters) => {
                                    setFilters(newFilters);
                                    setPage(1); // Reset page on filter change
                                }}
                            />
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="mb-6 hidden items-center justify-between lg:flex">
                        <div className="text-sm text-muted-foreground">
                            {productsData?.total ?? 0} Products
                        </div>
                        <SortDropdown value={sort} onChange={(s) => { setSort(s); setPage(1); }} />
                    </div>

                    {isProductsLoading ? (
                        <ProductGrid>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </ProductGrid>
                    ) : productsData && (productsData.products?.length ?? 0) > 0 ? (
                        <>
                            <ProductGrid>
                                {productsData?.products?.map((product: any) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </ProductGrid>
                            <Pagination
                                currentPage={productsData?.page ?? 1}
                                totalPages={Math.ceil((productsData?.total ?? 0) / (productsData?.limit ?? 10))}
                                onPageChange={setPage}
                                className="mt-12"
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center">
                            <h3 className="mb-2 text-lg font-semibold text-foreground">No Products Found</h3>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your filters or search query to find what you&apos;re looking for.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => {
                                    setFilters({ categories: [] });
                                    setSearchQuery(undefined);
                                }}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <React.Suspense fallback={
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <ProductsContent />
        </React.Suspense>
    );
}


