"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./MediaImageLightbox.module.css";

export type LightboxItem = { src: string; alt: string };

type Props = {
  open: boolean;
  items: LightboxItem[];
  initialIndex: number;
  onClose: () => void;
};

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MediaImageLightbox({ open, items, initialIndex, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (open) {
      setIndex(Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1)));
    }
  }, [open, initialIndex, items.length]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const len = items.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowRight" && len > 1) {
        e.preventDefault();
        setDirection("next");
        setIndex((i) => (i + 1) % len);
      }
      if (e.key === "ArrowLeft" && len > 1) {
        e.preventDefault();
        setDirection("prev");
        setIndex((i) => (i - 1 + len) % len);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length, onClose]);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus({ preventScroll: true });
  }, [open]);

  const goNext = useCallback(() => {
    if (items.length <= 1) return;
    setDirection("next");
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    if (items.length <= 1) return;
    setDirection("prev");
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  if (!mounted || !open || items.length === 0) return null;

  const item = items[index];
  if (!item) return null;

  const slideClass = direction === "next" ? styles.slideNext : styles.slidePrev;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      onClick={onClose}
    >
      <div className={styles.shell} onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeBtnRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close gallery"
        >
          <span aria-hidden="true">×</span>
        </button>

        {items.length > 1 && (
          <button type="button" className={`${styles.nav} ${styles.navPrev}`} onClick={goPrev} aria-label="Previous image">
            <ChevronLeft />
          </button>
        )}
        {items.length > 1 && (
          <button type="button" className={`${styles.nav} ${styles.navNext}`} onClick={goNext} aria-label="Next image">
            <ChevronRight />
          </button>
        )}

        <div className={styles.frame}>
          <div key={`${index}-${item.src}`} className={`${styles.slideWrap} ${slideClass}`}>
            <div className={styles.imageBox}>
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className={styles.image}
                sizes="(max-width: 1200px) 92vw, 1100px"
              />
            </div>
          </div>
        </div>

        {items.length > 1 && (
          <div className={styles.counter} aria-live="polite">
            {index + 1} <span className={styles.counterSep}>/</span> {items.length}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
