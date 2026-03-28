"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";
import { useCart } from "@/modules/cart/hooks/useCart";
import { queryKeys } from "@/lib/queryKeys";
import styles from "./CartSheet.module.css";

export interface CartSheetProps {}

export function CartSheet({}: Readonly<CartSheetProps>) {
  const router = useRouter();
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);

  const queryClient = useQueryClient();
  const { status } = useSession();
  const { cart, isLoading, removeItem, updateItem, isUpdating, isRemoving } = useCart();
  const items = cart?.items ?? [];
  const total = cart?.subtotal ?? 0;

  useEffect(() => {
    console.log("cart open state:", isOpen);
    if (isOpen && status === 'authenticated') {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    }
  }, [isOpen, status, queryClient]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.body.style.setProperty("overflow", "hidden");
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.removeProperty("overflow");
    };
  }, [closeCart, isOpen]);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      updateItem({ id: productId, quantity });
    }
  };

  return (
    <div className={`fixed inset-0 z-[200] ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <aside
        className={`${styles.sheet} transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ShoppingBag size={20} />
            <h2>Your Cart</h2>
          </div>
        </div>

        <div className={styles.content}>
          {status !== 'authenticated' ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
              <h3>Please login to view your cart</h3>
              <button
                className={styles.shopButton}
                onClick={() => { closeCart(); router.push('/login'); }}
              >
                Login
              </button>
            </div>
          ) : isLoading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
              <p>Loading your cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven&apos;t added anything to your cart yet.</p>
              <button
                className={styles.shopButton}
                onClick={() => { closeCart(); router.push("/products"); }}
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {items.map((item) => {
                if (!item?.product) return null;
                const productId = item.productId ?? item.product.id;
                const image = item.product.thumbnail ?? item.product.images?.[0] ?? null;
                return (
                  <article
                    className={styles.item}
                    key={item.id}
                  >
                    <div className={styles.visual}>
                      <img
                        src={image ?? '/images/product-placeholder.png'}
                        alt={item.product.name}
                        className={styles.itemImage}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/product-placeholder.png';
                        }}
                      />
                    </div>

                    <div className={styles.itemInfo}>
                      <div className={styles.itemMain}>
                        <h3 className={styles.itemName}>{item.product.name}</h3>
                        <span className={styles.itemPrice}>
                          ₹{Number(item.product.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className={styles.itemActions}>
                        <div className={styles.quantityControl}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => handleUpdateQuantity(productId, item.quantity - 1)}
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => handleUpdateQuantity(productId, item.quantity + 1)}
                            type="button"
                            aria-label="Increase quantity"
                            disabled={isUpdating}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          className={styles.removeBtn}
                          onClick={() => removeItem(productId)}
                          type="button"
                          aria-label="Remove item"
                          disabled={isRemoving}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {status === 'authenticated' && items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.footerInner}>
              <div className={styles.totalBlock}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>₹{Number(total || 0).toFixed(2)}</span>
              </div>
              <button
                className={styles.checkoutButton}
                type="button"
                onClick={() => { closeCart(); router.push("/checkout"); }}
              >
                Continue to checkout
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
