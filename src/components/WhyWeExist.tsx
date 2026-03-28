"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./WhyWeExist.module.css";

gsap.registerPlugin(ScrollTrigger);

export interface WhyWeExistProps {
  eyebrow: string;
  intro: string;
  fragments: readonly string[];
  images?: readonly string[];
}

export function WhyWeExist({
  eyebrow,
  intro,
  fragments,
  images = []
}: Readonly<WhyWeExistProps>) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLParagraphElement | null>(null);
  const motionRefs = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const speeds = [24, 16, 28, 20, 26];
    const ctx = gsap.context(() => {
      motionRefs.current.forEach((element, index) => {
        if (!element) {
          return;
        }

        gsap.set(element, {
          "--parallax-y": "0px",
          "--drift-y": "0px"
        });

        gsap.to(element, {
          "--parallax-y": `${-speeds[index]}px`,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.fromTo(
          element,
          {
            "--drift-y": `${index % 2 === 0 ? -4 : -8}px`
          },
          {
            "--drift-y": `${index % 2 === 0 ? 8 : 10}px`,
            duration: 3.8 + index * 0.35,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          }
        );
      });

      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0.15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true
          }
        });
      }

      if (introRef.current) {
        const words = introRef.current.querySelectorAll(`.${styles.word}`);
        gsap.to(words, {
          opacity: 1,
          stagger: 0.1,
          color: 'var(--color-primary)',
          ease: "none",
          scrollTrigger: {
            trigger: introRef.current,
            start: "top 80%",
            end: "bottom 40%",
            scrub: 1
          }
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className={`${styles.section} section`} id="why" ref={sectionRef}>
      <div className={styles.darkenOverlay} ref={overlayRef} aria-hidden="true" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <span className="eyebrow">{eyebrow}</span>
            <p className={styles.intro} ref={introRef}>
              {intro.split(/\s+/).map((word, i) => (
                <span key={i} className={styles.word}>
                  {word}{" "}
                </span>
              ))}
            </p>
          </div>
          <div className={styles.collage}>
            <div
              className={`${styles.motionTarget} ${styles.tile} ${styles.tileLarge} fadeIn`.trim()}
              ref={(node) => {
                if (node) {
                  motionRefs.current[0] = node;
                }
              }}
            >
              <span>01</span>
              <p>{fragments[0]}</p>
            </div>
            <div
              aria-hidden="true"
              className={`${styles.motionTarget} ${styles.imageTile} fadeIn`.trim()}
              ref={(node) => {
                if (node) {
                  motionRefs.current[1] = node;
                }
              }}
            >
              {images[0] && (
                <img src={images[0]} alt="" className={styles.fullImage} />
              )}
            </div>
            <div
              className={`${styles.motionTarget} ${styles.tile} fadeIn`.trim()}
              ref={(node) => {
                if (node) {
                  motionRefs.current[2] = node;
                }
              }}
            >
              <span>02</span>
              <p>{fragments[1]}</p>
            </div>
            <div
              className={`${styles.motionTarget} ${styles.tile} ${styles.offset} fadeIn`.trim()}
              ref={(node) => {
                if (node) {
                  motionRefs.current[3] = node;
                }
              }}
            >
              <span>03</span>
              <p>{fragments[2]}</p>
            </div>
            <div
              aria-hidden="true"
              className={`${styles.motionTarget} ${styles.imageTile} ${styles.imageWarm} fadeIn`.trim()}
              ref={(node) => {
                if (node) {
                  motionRefs.current[4] = node;
                }
              }}
            >
              {images[1] && (
                <img src={images[1]} alt="" className={styles.fullImage} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
