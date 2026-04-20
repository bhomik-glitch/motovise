import type { MetadataRoute } from 'next';

const BASE_URL = 'https://motovise-pied.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://motovise-backend-production.up.railway.app/v1';

interface Product {
    slug: string;
    updatedAt?: string;
}

interface ProductsApiResponse {
    success: boolean;
    data: {
        items: Product[];
    };
}

async function getProductSlugs(): Promise<Pick<Product, 'slug' | 'updatedAt'>[]> {
    try {
        const res = await fetch(`${API_URL}/products?limit=200&page=1`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const json: ProductsApiResponse = await res.json();
        return json?.data?.items ?? [];
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await getProductSlugs();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
    ];

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${BASE_URL}/product/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
}
