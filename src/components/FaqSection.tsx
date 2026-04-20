"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/landingContent";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface FaqSectionProps {
  eyebrow: string;
  title: string;
  items: readonly FaqItem[];
}

export function FaqSection({ eyebrow, title, items }: Readonly<FaqSectionProps>) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      style={{ scrollMarginTop: "68px", background: "#f9f8f6", padding: "120px 0" }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1.7fr",
          gap: 100,
          alignItems: "flex-start",
        }}
      >
        {/* ── Left sticky col ── */}
        <div style={{ position: "sticky", top: 120 }}>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#9ca3af",
              marginBottom: 20,
            }}
          >
            {eyebrow}
          </p>

          <h2
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "clamp(2.2rem, 3.5vw, 3rem)",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: 24,
              maxWidth: "10ch",
            }}
          >
            {title}
          </h2>

          <div
            style={{
              width: 40,
              height: 3,
              background: "#0f172a",
              marginBottom: 28,
              borderRadius: 2,
            }}
          />

          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 14,
              color: "#6b7280",
              lineHeight: 1.75,
              marginBottom: 44,
              maxWidth: "28ch",
            }}
          >
            Everything you need to know before you buy — answered plainly.
          </p>

          <Link href="/faq" style={{ textDecoration: "none" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "#0f172a",
                border: "2px solid #0f172a",
                padding: "12px 22px",
                borderRadius: 100,
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "#0f172a";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#0f172a";
              }}
            >
              View All FAQs
              <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>

        {/* ── Right accordion col ── */}
        <div style={{ borderTop: "2px solid #d1d5db" }}>
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            const num = String(i + 1).padStart(2, "0");

            return (
              <div
                key={item.question}
                style={{ borderBottom: "2px solid #d1d5db" }}
              >
                <button
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  type="button"
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "36px 1fr 40px",
                    alignItems: "center",
                    gap: 20,
                    padding: "28px 0",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {/* Index */}
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      color: isOpen ? "#0f172a" : "#d1d5db",
                      transition: "color 0.25s",
                      userSelect: "none",
                    }}
                  >
                    {num}
                  </span>

                  {/* Question */}
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
                      fontWeight: isOpen ? 700 : 600,
                      color: isOpen ? "#0f172a" : "#374151",
                      lineHeight: 1.3,
                      transition: "color 0.25s, font-weight 0.15s",
                    }}
                  >
                    {item.question}
                  </span>

                  {/* Toggle mark */}
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: `2px solid ${isOpen ? "#0f172a" : "#d1d5db"}`,
                      background: isOpen ? "#0f172a" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.25s ease",
                      marginLeft: "auto",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{
                        transition: "transform 0.3s ease",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      <path
                        d="M6 1v10M1 6h10"
                        stroke={isOpen ? "#fff" : "#374151"}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>

                {/* Panel */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows 380ms cubic-bezier(0.4,0,0.2,1)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ minHeight: 0 }}>
                    <p
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 14,
                        color: "#6b7280",
                        lineHeight: 1.8,
                        padding: "0 0 28px 56px",
                        margin: 0,
                        maxWidth: "56ch",
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? "translateY(0)" : "translateY(8px)",
                        transition: "opacity 350ms ease, transform 350ms ease",
                        transitionDelay: isOpen ? "80ms" : "0ms",
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
