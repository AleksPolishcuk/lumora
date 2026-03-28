"use client";

import styles from "./Toast.module.css";
import type { ToastVariant } from "../../context/ToastContext";

interface Item {
  id: string;
  message: string;
  variant: ToastVariant;
}

export function ToastViewport({
  toasts,
  onDismiss
}: {
  toasts: Item[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.region} aria-live="polite" aria-relevant="additions text">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.variant]}`}
          role="status"
        >
          <span className={styles.icon} aria-hidden>
            {t.variant === "success" && "✓"}
            {t.variant === "error" && "!"}
            {t.variant === "info" && "◆"}
          </span>
          <p className={styles.message}>{t.message}</p>
          <button
            type="button"
            className={styles.close}
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
