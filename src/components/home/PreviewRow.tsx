'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SectionIntro } from './SectionIntro';
import styles from './PreviewRow.module.css';
import { useCart } from '@/modules/cart/hooks/useCart';
import { toast } from 'react-hot-toast';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';
import { useCartStore } from '@/store/useCartStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';

export interface PreviewCard {
  id: string;
  title: string;
  tagline: string;
  price: number;
  image: string;
  tone: 'cool' | 'warm' | 'berry' | 'citrus';
  badge?: 'Best Seller' | 'New' | 'Popular';
}

export interface PreviewRowProps {
  eyebrow: string;
  title: string;
  description: string;
  cards: readonly PreviewCard[];
}

export function PreviewRow({
  eyebrow,
  title,
  description,
  cards,
}: Readonly<PreviewRowProps>) {
  const { addItemAsync } = useCart();
  const openCart = useCartStore((state: any) => state.openCart);
  const { data: session } = useSession();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Landing-content cards use slugs as `id`. Resolve them to real DB IDs once
  // so the cart always sends the actual product primary key.
  const slugs = useMemo(() => cards.map((c) => c.id), [cards]);
  const { data: slugToDbId } = useQuery({
    queryKey: ['products', 'slugMap', slugs],
    queryFn: async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        slugs.map(async (slug) => {
          try {
            const { data } = await api.get<{ success: boolean; data: { id: string } }>(
              `/products/${slug}`,
            );
            map[slug] = data.data.id;
          } catch {
            // product not in DB — skip
          }
        }),
      );
      return map;
    },
    staleTime: 5 * 60_000,
  });

  const handleAddToCart = async (e: React.MouseEvent, card: PreviewCard) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push('/login');
      return;
    }

    const productId = slugToDbId?.[card.id];
    if (!productId) {
      toast.error('Product not available');
      return;
    }

    try {
      await addItemAsync({ productId, quantity: 1 });
      toast.success(`${card.title} added to cart!`);
      openCart();
    } catch (error: unknown) {
      toast.error(
        (error as any)?.message || 'Failed to add to cart'
      );
    }
  };

  return (
    <section className="hp-section relative z-10" id="shop">
      <div className="absolute inset-0 z-[-1] pointer-events-none bg-gradient-to-b from-transparent to-[var(--color-surface)]/20" />
      <div className="hp-container">
        <ScrollReveal>
          <SectionIntro eyebrow={eyebrow} title={title} description={description} />
        </ScrollReveal>
        
        <StaggerContainer className={`${styles.row} hide-scrollbar`}>
          {cards.map((card, idx) => {
            const isHovered = hoveredCard === card.id;
            const badge = idx === 0 ? 'Best Seller' : idx === 1 ? 'New' : idx === 2 ? 'Popular' : null;
            
            return (
              <StaggerItem
                className={`${styles.card} group`}
                key={card.title}
              >
                <div 
                  className="w-full h-full absolute inset-0 rounded-[var(--radius-card)] z-0 transition-opacity duration-300 pointer-events-none shadow-[0_0_30px_rgba(124,156,245,0.1)] group-hover:opacity-100 opacity-0" 
                />
                
                <Link 
                  href={`/product/${card.id}`} 
                  className={`${styles.visual} relative z-10 block overflow-hidden`}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <img src={card.image} alt={card.title} className={`${styles.cardImage} transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110`} />
                  
                  {badge && (
                    <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-sm border border-[var(--color-accent)]/30">
                      {badge}
                    </div>
                  )}

                  <div className={`absolute inset-x-0 bottom-0 p-4 transform transition-transform duration-300 ease-in-out ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} z-20 flex justify-center`}>
                    <button 
                      className="w-full bg-[var(--color-accent)] text-black font-bold uppercase tracking-widest text-xs py-3 rounded-full shadow-[0_4px_14px_rgba(124,156,245,0.4)] hover:bg-white hover:shadow-[0_4px_20px_rgba(255,255,255,0.6)] transition-all active:scale-95"
                      onClick={(e) => handleAddToCart(e, card)}
                      type="button"
                    >
                      Quick Add - ${card.price}
                    </button>
                  </div>
                </Link>
                <div className={`${styles.cardBody} relative z-10 bg-[var(--color-surface)]`}>
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.tagline}</p>
                  </div>
                  <div className={styles.footer}>
                    <span className={styles.price}>${card.price}</span>
                    <button 
                      className={`${styles.addToCart} group-hover:bg-[var(--color-accent)] group-hover:text-black group-hover:border-[var(--color-accent)]`} 
                      onClick={(e) => handleAddToCart(e, card)}
                      type="button"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
