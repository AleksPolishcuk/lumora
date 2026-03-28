"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../app/title/[id]/TitlePage.module.css";

export function TitleHero({ item, onPlay }: { item: any; onPlay?: () => void }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      setOffset(Math.min(72, y * 0.18));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "";
  const backdrop = item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const duration = item.runtime ? `${item.runtime}min` : "N/A";
  const tagList = useMemo(() => (item.genres || []).slice(0, 3), [item.genres]);

  return (
    <section className={styles.hero}>
      <div
        className={styles.parallaxLayer}
        style={{
          backgroundImage: backdrop ? `url(${backdrop})` : undefined,
          transform: `translateY(${offset}px) scale(1.06)`
        }}
      />
      <div className={styles.overlay} />
      <div className={styles.heroInner}>
        <Link href="/" className={styles.backBtn}>← Back</Link>
        <div className={styles.head}>
          {poster ? (
            <Image className={styles.poster} src={poster} alt={item.title || item.name || "Poster"} width={340} height={510} />
          ) : (
            <div className={styles.poster} />
          )}
          <div>
            <div className={styles.tags}>
              {tagList.map((g: any) => <span key={g.id}>{String(g.name).toUpperCase()}</span>)}
            </div>
            <h1 className={styles.title}>{item.title || item.name}</h1>
            <div className={styles.meta}>
              <span>{year || "N/A"}</span>
              <span>R</span>
              <span>{duration}</span>
              <span>{item.media_type || "Movie"}</span>
            </div>
            <p className={styles.overview}>{item.overview}</p>
            <div className={styles.actions}>
              {onPlay ? (
                <button className={styles.playBtn} onClick={onPlay}>▶ Play Now</button>
              ) : (
                <button className={styles.playBtn}>▶ Play Now</button>
              )}
              <a className={styles.watchBtn} href="#actors">More Info</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
