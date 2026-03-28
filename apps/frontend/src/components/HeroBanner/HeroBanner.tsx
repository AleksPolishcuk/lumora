"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./HeroBanner.module.css";

export function HeroBanner({ items = [] as any[] }) {
  const safeItems = useMemo(() => (items.length ? items : [{ id: 0, title: "Lumora", overview: "Streaming platform MVP" }]), [items]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((v) => (v + 1) % safeItems.length), 5000);
    return () => clearInterval(id);
  }, [safeItems.length]);

  const current = safeItems[index];
  const bg = current.backdrop_path ? `https://image.tmdb.org/t/p/original${current.backdrop_path}` : "";
  const year = (current.release_date || current.first_air_date || "2024").slice(0, 4);
  const runtime = current.runtime ? `${current.runtime}min` : "52min";
  const type = current.media_type || "MOVIE";
  const contentType = current.media_type === "tv" || current.first_air_date ? "tv" : "movie";

  return (
    <section className={styles.hero} style={{ backgroundImage: bg ? `url(${bg})` : undefined }}>
      <div className={styles.overlay} />
      <div className={`${styles.heroShell} lumoraContainer`}>
        <div className={styles.content}>
          <div className={styles.tags}>
            <span>SCI-FI</span>
            <span>THRILLER</span>
          </div>
          <h1 className={styles.title}>{current.title || current.name}</h1>
          <div className={styles.meta}>
            <span>{year}</span>
            <span>TV-MA</span>
            <span>{runtime}</span>
            <span>{String(type).toUpperCase()}</span>
          </div>
          <p>{current.overview || "In a sprawling megacity where corporations rule and shadows hide secrets, one detective uncovers a conspiracy that could rewrite history."}</p>
          <div className={styles.cta}>
            <Link className={styles.playBtn} href={`/watch/${current.id}?type=${contentType}`}>Play Now</Link>
            <Link className={styles.infoBtn} href={`/title/${current.id}?type=${contentType}`}>More Info</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
