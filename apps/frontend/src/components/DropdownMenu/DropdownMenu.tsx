"use client";

import { useId, useState } from "react";
import styles from "./DropdownMenu.module.css";

interface Props {
  favorite: boolean;
  watchLater: boolean;
  rating: number | null;
  onFavorite: () => void;
  onWatchLater: () => void;
  onRate: (value: number) => void;
  /** Renders without absolute offsets (use inside fixed-position portal wrapper). */
  layout?: "default" | "floating";
}

function SpriteIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} width={14} height={14} aria-hidden>
      <use href={`/icons/sprite.svg#${id}`} />
    </svg>
  );
}

function StarRating({
  value,
  onChange
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId().replace(/:/g, "");
  const active = hover ?? value ?? 0;

  return (
    <div
      className={styles.starRow}
      onMouseLeave={() => setHover(null)}
      role="group"
      aria-label="Star rating"
    >
      <svg width={0} height={0} className={styles.starGradDef} aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d78a" />
            <stop offset="55%" stopColor="#e8a632" />
            <stop offset="100%" stopColor="#c9781a" />
          </linearGradient>
        </defs>
      </svg>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={styles.starBtn}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} of 5 stars`}
        >
          <svg viewBox="0 0 24 24" className={styles.starSvg} aria-hidden>
            <polygon
              className={n <= active ? styles.starPolyFill : styles.starPolyEmpty}
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={n <= active ? `url(#${gradId})` : "rgba(12, 10, 22, 0.55)"}
              strokeWidth={1.15}
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function RatingSummary({ value }: { value: number | null }) {
  if (value == null) return null;
  return (
    <span className={styles.inlineStars} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? styles.inlineStarOn : styles.inlineStarOff}>
          ★
        </span>
      ))}
    </span>
  );
}

export function DropdownMenu(props: Props) {
  const [showStars, setShowStars] = useState(false);
  const layout = props.layout ?? "default";

  return (
    <div
      className={`${styles.menu} ${layout === "floating" ? styles.menuFloating : ""}`}
      role="menu"
    >
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <button
          type="button"
          className={`${styles.row} ${props.favorite ? styles.rowActive : ""}`}
          onClick={props.onFavorite}
          role="menuitem"
        >
          <span className={styles.rowIcon}>
            <SpriteIcon id="icon-heart" className={props.favorite ? styles.iconFilled : undefined} />
          </span>
          <span className={styles.rowText}>Favorite</span>
          {props.favorite && <span className={styles.pill}>On</span>}
        </button>

        <button
          type="button"
          className={`${styles.row} ${props.watchLater ? styles.rowActive : ""}`}
          onClick={props.onWatchLater}
          role="menuitem"
        >
          <span className={styles.rowIcon}>
            <SpriteIcon id="icon-bookmark" className={props.watchLater ? styles.iconFilled : undefined} />
          </span>
          <span className={styles.rowText}>Watch later</span>
          {props.watchLater && <span className={styles.pill}>On</span>}
        </button>

        <div className={styles.divider} role="presentation" />

        <button
          type="button"
          className={`${styles.row} ${styles.rowExpand} ${showStars ? styles.rowOpen : ""}`}
          onClick={() => setShowStars((v) => !v)}
          aria-expanded={showStars}
          role="menuitem"
        >
          <span className={styles.rowIcon}>
            <SpriteIcon id="icon-star" />
          </span>
          <span className={styles.rowText}>
            Rating
            <RatingSummary value={props.rating} />
          </span>
          <span className={`${styles.chevron} ${showStars ? styles.chevronUp : ""}`} aria-hidden />
        </button>

        {showStars && (
          <div className={styles.ratingWrap}>
            <StarRating value={props.rating} onChange={props.onRate} />
          </div>
        )}
      </div>
    </div>
  );
}
