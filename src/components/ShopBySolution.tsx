"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { SectionIntro } from "./SectionIntro";
import styles from "./ShopBySolution.module.css";

export interface ShopBySolutionProps {
  eyebrow: string;
  title: string;
  description: string;
  cards: any[];
}

export function ShopBySolution({
  eyebrow,
  title,
  description,
  cards: initialCards
}: Readonly<ShopBySolutionProps>) {
  // const addItem = useCartStore((state) => state.addItem);
  // const openCart = useCartStore((state) => state.openCart);


  return (
    <section className="section" id="shop">
      <div className="container">
        <SectionIntro eyebrow={eyebrow} title={title} description={description} />
        
        <div className={styles.grid}>
          {initialCards.map((card, index) => (
            <div key={index} className={styles.card}>
              <Link href={`/product/${card.id}`} className={styles.cardLink}>
                <div className={`${styles.visual} ${styles[card.tone] || styles.cool}`}>
                  <img src={card.image} alt="" className={styles.cardImage} />
                </div>
                <div className={styles.content}>
                  <div className={styles.textGroup}>
                    <h3>{card.name}</h3>
                    <p>{card.tagline}</p>
                  </div>
                </div>
              </Link>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
