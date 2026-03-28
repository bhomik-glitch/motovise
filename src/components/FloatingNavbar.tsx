"use client";

// Force HMR update
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, ShoppingBag, Menu, X, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { useCart } from "@/modules/cart/hooks/useCart";
import styles from "./FloatingNavbar.module.css";

interface FloatingNavbarProps {
  brand?: string;
  links?: Array<{ label: string; href: string }>;
  utilityItems?: string[];
}

export function FloatingNavbar({
  brand = "MOTOVISE",
  links: customLinks,
}: FloatingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isHeroPage = pathname === "/";
  const shouldShowSolid = !isHeroPage || isScrolled;

  const toggleCart = useCartStore((state: any) => state.toggleCart);
  const { cart } = useCart();
  const itemCount = cart?.itemCount ?? cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleProfileClick = () => {
    if (!session) {
      router.push("/login");
    } else {
      router.push("/account");
    }
  };

  const handleCartClick = () => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    toggleCart();
  };

  const links = customLinks ?? [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "Combo", href: "#starter-bundle", isScroll: true },
    { label: "Blog", href: "#newsletter-section", isScroll: true },
    { label: "FAQ", href: "#faq", isScroll: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <header className={`${styles.navbar} ${shouldShowSolid ? styles.navbarScrolled : ""} ${!isHeroPage ? styles.navbarStatic : ""}`}>
      <div className={styles.navLeft}>
        <Link className={styles.brand} href="/">
          {brand}
        </Link>
      </div>

      <div className={styles.navCenter}>
        <nav className={styles.navPill} aria-label="Primary">
          {links.map((link) => {
            if (link.isScroll) {
              return (
                <a
                  className={styles.navItem}
                  href={link.href}
                  key={link.label}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.querySelector(link.href) as HTMLElement;
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    } else {
                      router.push("/" + link.href);
                    }
                  }}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                className={styles.navItem}
                href={link.href}
                key={link.label}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.navRight}>
        <div className={styles.searchWrapper} ref={searchContainerRef}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search parts..."
            className={`${styles.searchInput} ${isSearchOpen ? styles.searchInputOpen : ""}`}
          />
          <button
            className={styles.utilityItem}
            onClick={toggleSearch}
            aria-label="Search"
          >
            <Search size={23} strokeWidth={2} />
          </button>
        </div>

        <button
          className={styles.utilityItem}
          onClick={handleProfileClick}
          aria-label="Account"
          type="button"
        >
          <User size={23} strokeWidth={2} />
        </button>

        <button
          className={styles.utilityItem}
          onClick={handleCartClick}
          type="button"
          aria-label={`Cart with ${itemCount} items`}
        >
          <ShoppingBag size={23} strokeWidth={2} />
          {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
        </button>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className={styles.menuButton}
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
          <span>MENU</span>
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ""}`}>
        <nav className={styles.mobileNav} aria-label="Mobile">
          {links.map((link) => {
            if (link.isScroll) {
              return (
                <a
                  className={styles.navItem}
                  href={link.href}
                  key={link.label}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    const el = document.querySelector(link.href);
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    } else {
                      router.push("/" + link.href);
                    }
                  }}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                className={styles.navItem}
                href={link.href}
                key={link.label}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.mobileUtility}>
          <button
            className={styles.utilityItem}
            type="button"
            onClick={() => { setIsOpen(false); handleProfileClick(); }}
          >
            <User size={22} />
            <span style={{ marginLeft: '12px', fontSize: '14px', letterSpacing: '1px' }}>ACCOUNT</span>
          </button>
          <button
            className={styles.utilityItem}
            onClick={() => {
              setIsOpen(false);
              handleCartClick();
            }}
            type="button"
          >
            <ShoppingBag size={22} />
            <span style={{ marginLeft: '12px', fontSize: '14px', letterSpacing: '1px' }}>BAG ({itemCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}

