"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { getAccessToken } from "../../lib/auth";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { SkeletonCard } from "../../components/SkeletonCard/SkeletonCard";
import browseStyles from "../BrowsePage.module.css";
import styles from "./FavoritesPage.module.css";

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth/signin?redirect=/favorites");
      setRedirecting(true);
      setReady(true);
      setLoading(false);
      return;
    }

    setReady(true);
    setError("");
    api<{ favorites: number[] }>("/user/favorites", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (fav) => {
        const result = await Promise.all(
          fav.favorites.slice(0, 20).map((id) => api<{ item: any }>(`/content/${id}?type=movie`).then((r) => r.item).catch(() => null))
        );
        setItems(result.filter(Boolean));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Couldn’t load favorites.");
        setLoading(false);
      });
  }, [router]);

  if (!ready) {
    return (
      <main className={styles.redirecting} aria-busy="true">
        Loading…
      </main>
    );
  }

  if (redirecting) {
    return (
      <main className={styles.redirecting} aria-busy="true">
        Redirecting to sign in…
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Favorites</h1>
      <p className={styles.subtitle}>Titles you love, saved in one place.</p>

      {loading ? (
        <section className={styles.grid}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </section>
      ) : error ? (
        <div className={styles.stateError} role="alert">
          {error}
          <div style={{ marginTop: 12 }}>
            <Link href="/" className={browseStyles.retryLink}>
              Back to home
            </Link>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <div className={styles.emptyIcon}>
              <HeartIcon />
            </div>
            <h2 className={styles.emptyHeading}>No favorites yet</h2>
            <p className={styles.emptyCopy}>
              Explore movies and series, then tap the menu on any card to add them here.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/movies" className={`${styles.cta} ${styles.ctaPrimary}`}>
                Browse movies
              </Link>
              <Link href="/series" className={`${styles.cta} ${styles.ctaGhost}`}>
                Browse series
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <section className={styles.grid}>{items.map((item) => <ContentCard key={item.id} item={item} />)}</section>
      )}
    </main>
  );
}
