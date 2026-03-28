"use client";

import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";

export interface FooterColumn {
  title: string;
  items: readonly string[];
}

export interface FooterProps {
  columns: readonly FooterColumn[];
  location: string;
  hours: string;
}

export function Footer({
  columns,
  location,
  hours
}: Readonly<FooterProps>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) return null;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <a className={styles.brand} href="#top">
            MOTOVISE
          </a>
          <div className={styles.columns}>
            {columns.map((column) => {
              const isSocial = column.title.toLowerCase() === "follow";
              return (
                <div
                  className={`${styles.column} ${isSocial ? styles.socialColumn : ""}`}
                  key={column.title}
                >
                  <span>{column.title}</span>
                  <div className={isSocial ? styles.socialIcons : styles.linksList}>
                    {column.items.map((item) => {
                      if (isSocial) {
                        const iconPath = `/logos/${item.toLowerCase()}${item.toLowerCase() === 'instagram' ? '-1' : '-color'}-svgrepo-com.svg`;
                        return (
                          <a href="#top" key={item} className={styles.socialLink} aria-label={item}>
                            <img src={iconPath} alt={item} />
                          </a>
                        );
                      }
                      return (
                        <a href="#top" key={item}>
                          {item}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.bottom}>
          <p>Copyright 2026 Motovise. All rights reserved.</p>
          <p>
            {location} / {hours}
          </p>
        </div>
      </div>
    </footer>
  );
}
