"use client";

import { useFeaturedProducts } from "@/modules/products/hooks/useProducts";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import styles from "./PreviewRow.module.css";
import type { Product } from "@/types/product";

export interface PreviewRowProps {
  eyebrow: string;
  title: string;
  description: string;
}

const imageMap: Record<string, string> = {
  "duo-connect-b": "/bg-remove-product-thumbnail/remove-bg-product-1.png",
  "duo-connectx": "/bg-remove-product-thumbnail/remove-bg-product-2.png",
  "y2-android-box": "/bg-remove-product-thumbnail/remove-bg-product-3.png",
  "playbox-max": "/bg-remove-product-thumbnail/remove-bg-product-4.png"
};

export function PreviewRow(_props: Readonly<PreviewRowProps>) {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const overrideImage = product.slug ? imageMap[product.slug] : undefined;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: overrideImage || product.thumbnail || (product.images && product.images[0]) || '/placeholder-product.png',
      tone: 'cool' // Default mapping for tone
    }, 1);
    openCart();
  };

  const displayProducts = featuredProducts?.slice(0, 4) || [];

  return (
    <section className={`${styles.productSection} section`} id="shop">
      <div className="container">
        <div className={styles.trustHeader}>
          <h2 className={styles.trustTitle}>Trusted by 10,000+ Drivers Across India</h2>
          <p className={styles.trustSubtext}>Reliable wireless CarPlay upgrades that work every time you start your car.</p>
          <div className={styles.trustRow}>
            <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
            <span className={styles.trustMeta}>4.8/5 average rating</span>
            <span className={styles.dot}>•</span>
            <span className={styles.trustMeta}>5,000+ installs</span>
            <span className={styles.dot}>•</span>
            <span className={styles.trustMeta}>Fast 3-sec setup</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-20 text-center">Loading products...</div>
        ) : (
          <div className={styles.grid}>
            {displayProducts.map((product: Product, index: number) => {
              const imgSrc = (product.slug ? imageMap[product.slug] : undefined) || product.thumbnail || (product.images && product.images[0]) || '/placeholder-product.png';
              // Fallbacks or formatting
              const formattedPrice = product.isComingSoon 
                ? "Coming Soon"
                : new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(product.price);

              const formattedComparePrice = product.compareAtPrice 
                ? new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(product.compareAtPrice)
                : null;
              
              const badge = index === 0 ? "BEST SELLER" : index === 1 ? "PREMIUM" : "NEW";

              return (
                <article
                  className={styles.card}
                  key={product.id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.gradientOverlay} />
                  
                  <div className={styles.badge}>{badge}</div>
                  
                  <Link href={`/product/${product.slug}`} className={styles.imageWrapper}>
                    <div className={styles.visual}>
                      <img src={imgSrc} alt={product.name} className={styles.cardImage} />
                    </div>
                  </Link>

                  <div className={styles.cardBody}>
                    <div className={styles.content}>
                      <h3 className={styles.name}>{product.name}</h3>
                      <p className={styles.description}>{product.shortDescription || ''}</p>
                    </div>
                    
                    <div className={styles.footer}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className={styles.price}>{formattedPrice}</span>
                        {formattedComparePrice && (
                          <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.8rem', color: '#666' }}>
                            {formattedComparePrice}
                          </span>
                        )}
                      </div>
                      <button 
                        className={styles.addToCart}
                        onClick={(e) => handleAddToCart(e, {
                          ...product,
                          thumbnail: imgSrc, // map over thumbnail for cart
                        })}
                        type="button"
                        disabled={product.stock <= 0 || product.isComingSoon}
                      >
                        {product.isComingSoon ? 'Unavailable' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

