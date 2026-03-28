"use client";

import { useMemo, useRef, useState } from "react";
import { ActorCard } from "../ActorCard/ActorCard";
import { ContentRow } from "../ContentRow/ContentRow";
import { MediaBlock } from "../MediaBlock/MediaBlock";
import { TitleHero } from "../TitleHero/TitleHero";
import { VideoPlayer } from "../VideoPlayer/VideoPlayer";
import styles from "../../app/title/[id]/TitlePage.module.css";

export function TitleDetails({
  item,
  cast,
  recommendations,
  similar
}: {
  item: any;
  cast: any[];
  recommendations: any[];
  similar: any[];
}) {
  const [showPlayer, setShowPlayer] = useState(false);
  const playerRef = useRef<HTMLElement | null>(null);
  const trailerKey = useMemo(
    () => item?.videos?.results?.find((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))?.key
      || item?.videos?.results?.find((v: any) => v.site === "YouTube")?.key
      || "",
    [item]
  );
  const handlePlayToggle = () => {
    setShowPlayer((prev) => {
      const next = !prev;

      if (next) {
        window.requestAnimationFrame(() => {
          playerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        });
      }

      return next;
    });
  };

  return (
    <main className={styles.page}>
      <TitleHero
        item={item}
        onPlay={handlePlayToggle}
      />

      {showPlayer && (
        <section ref={playerRef} className={`${styles.section} ${styles.playerSection}`} id="title-player">
          <div className={styles.playerContain}>
            <div className={styles.playerHead}>
              <h2>Now Playing</h2>
              <button className={styles.playerClose} onClick={() => setShowPlayer(false)}>Close</button>
            </div>
            <div className={styles.playerBody}>
              <VideoPlayer keyId={trailerKey} />
            </div>
          </div>
        </section>
      )}

      <section className={styles.section} id="actors">
        <h2>Actors</h2>
        <div className={styles.actors}>
          {cast.map((actor: any) => <ActorCard key={actor.id} actor={actor} />)}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Media</h2>
        <MediaBlock item={item} />
      </section>

      <ContentRow title="Recommendations" items={recommendations} />
      <ContentRow title="Similar Content" items={similar} />
    </main>
  );
}
