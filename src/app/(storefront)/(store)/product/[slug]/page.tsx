import type { Metadata } from 'next';
import type { Product } from '@/types/product';
import ProductClient from '@/modules/product/ProductClient';

const BASE_URL = 'https://motovise-pied.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchProduct(slug: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/products/${slug}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? null;
    } catch {
        return null;
    }
}

export async function generateMetadata(
    { params }: { params: { slug: string } }
): Promise<Metadata> {
    const product = await fetchProduct(params.slug);

    if (!product) {
        return { title: 'Product Not Found | Motovise' };
    }

    const title = product.metaTitle ?? product.name;
    const description =
        product.metaDescription ??
        product.shortDescription ??
        product.description ??
        'Premium automotive part from Motovise.';
    const image =
        product.images?.[0] ??
        product.thumbnail ??
        `${BASE_URL}/motovise-logo.png`;
    const url = `${BASE_URL}/product/${product.slug}`;

    return {
        title: `${title} | Motovise`,
        description,
        openGraph: {
            title,
            description,
            url,
            images: [{ url: image, alt: title }],
        },
    };
}

export default async function ProductPage(
    { params }: { params: { slug: string } }
) {
    const product = await fetchProduct(params.slug);
    return <ProductClient product={product} />;
}
