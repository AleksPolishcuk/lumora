"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MediaImageLightbox } from "../MediaImageLightbox/MediaImageLightbox";
import { VideoPlayer } from "../VideoPlayer/VideoPlayer";
import styles from "./MediaBlock.module.css";

export function MediaBlock({ item }: { item: any }) {
  const [tab, setTab] = useState<"videos" | "photos" | "posters">("videos");
  const [activeVideoKey, setActiveVideoKey] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const entries =
    tab === "videos"
      ? item.videos?.results || []
      : tab === "photos"
        ? item.images?.backdrops || []
        : item.images?.posters || [];

  const lightboxItems = useMemo(() => {
    if (tab !== "photos" && tab !== "posters") return [];
    const list = tab === "photos" ? item.images?.backdrops || [] : item.images?.posters || [];
    return list.slice(0, 8).map((entry: any, i: number) => ({
      src: `https://image.tmdb.org/t/p/original${entry.file_path}`,
      alt: tab === "photos" ? `Photo ${i + 1}` : `Poster ${i + 1}`
    }));
  }, [tab, item.images]);

  useEffect(() => {
    setLightboxOpen(false);
  }, [tab]);

  return (
    <section className={styles.wrap}>
      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${tab === "videos" ? styles.active : ""}`} onClick={() => setTab("videos")}>
          Videos
        </button>
        <button className={`${styles.tabBtn} ${tab === "photos" ? styles.active : ""}`} onClick={() => setTab("photos")}>
          Photos
        </button>
        <button className={`${styles.tabBtn} ${tab === "posters" ? styles.active : ""}`} onClick={() => setTab("posters")}>
          Posters
        </button>
      </div>
      {tab === "videos" && activeVideoKey && (
        <div className={styles.playerWrap}>
          <VideoPlayer keyId={activeVideoKey} />
        </div>
      )}
      {entries.length === 0 ? (
        <div className={styles.empty}>No media available in this category.</div>
      ) : (
        <div className={styles.grid}>
          {entries.slice(0, 8).map((entry: any, i: number) =>
            tab === "videos" ? (
              <button
                key={entry.key || i}
                type="button"
                className={styles.videoCard}
                onClick={() => setActiveVideoKey(entry.key || "")}
                aria-label={`Play ${entry.name || "video"}`}
              >
                <Image
                  src={`https://i.ytimg.com/vi/${entry.key}/hqdefault.jpg`}
                  alt={entry.name || "media"}
                  width={500}
                  height={281}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <span className={styles.playBadge}>▶ Play</span>
              </button>
            ) : (
              <button
                key={entry.file_path || i}
                type="button"
                className={styles.thumbBtn}
                onClick={() => {
                  setLightboxIndex(i);
                  setLightboxOpen(true);
                }}
                aria-label={`Open ${tab === "photos" ? "photo" : "poster"} ${i + 1} in gallery`}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w500${entry.file_path}`}
                  alt=""
                  width={500}
                  height={281}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </button>
            )
          )}
        </div>
      )}

      <MediaImageLightbox
        open={lightboxOpen}
        items={lightboxItems}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
}
