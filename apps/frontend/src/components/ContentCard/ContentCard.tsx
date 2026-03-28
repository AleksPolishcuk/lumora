"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { DropdownMenu } from "../DropdownMenu/DropdownMenu";
import styles from "./ContentCard.module.css";
import { apiAuth } from "../../lib/api";
import { getAccessToken } from "../../lib/auth";
import { useToast } from "../../context/ToastContext";

interface Props {
  item: any;
}

const MENU_WIDTH = 168;

export function ContentCard({ item }: Props) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLElement>(null);
  const dotsRef = useRef<HTMLButtonElement>(null);
  const menuPortalRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const token = getAccessToken();
  const contentType = item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
  const label = item.title || item.name || "This title";

  useEffect(() => {
    if (!menu || !token) return;
    let active = true;
    Promise.all([
      apiAuth<{ favorites: number[] }>("/user/favorites", token),
      apiAuth<{ watchLater: number[] }>("/user/watch-later", token),
      apiAuth<{ ratings: { tmdbId: number; value: number }[] }>("/user/ratings", token)
    ])
      .then(([favRes, wlRes, ratingRes]) => {
        if (!active) return;
        setFavorite(favRes.favorites.includes(item.id));
        setWatchLater(wlRes.watchLater.includes(item.id));
        setRating(ratingRes.ratings.find((r) => r.tmdbId === item.id)?.value || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [item.id, menu, token]);

  useEffect(() => {
    if (!menu) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      const root = cardRef.current;
      const portal = menuPortalRef.current;
      if (!root) return;
      const t = e.target;
      if (t instanceof Node && !root.contains(t) && !(portal && portal.contains(t))) setMenu(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [menu]);

  useLayoutEffect(() => {
    if (!menu) {
      setMenuPos(null);
      return;
    }

    const place = () => {
      const el = dotsRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let left = r.right - MENU_WIDTH - 4;
      left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));
      const top = r.bottom + 4;
      setMenuPos({ top, left });
    };

    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [menu]);

  const onFavorite = async () => {
    if (!token) {
      toast("Sign in to save favorites.", "error");
      return;
    }
    try {
      const res = await apiAuth<{ favorites: number[] }>(`/user/favorites/${item.id}`, token, { method: "POST" });
      const on = res.favorites.includes(item.id);
      setFavorite(on);
      toast(on ? `Added to favorites — ${label.slice(0, 48)}${label.length > 48 ? "…" : ""}` : `Removed from favorites`, on ? "success" : "info");
    } catch (e: any) {
      toast(e.message || "Couldn’t update favorites.", "error");
    }
  };

  const onWatchLater = async () => {
    if (!token) {
      toast("Sign in to use Watch later.", "error");
      return;
    }
    try {
      const res = await apiAuth<{ watchLater: number[] }>(`/user/watch-later/${item.id}`, token, { method: "POST" });
      const on = res.watchLater.includes(item.id);
      setWatchLater(on);
      toast(
        on ? `Saved for later — ${label.slice(0, 48)}${label.length > 48 ? "…" : ""}` : `Removed from Watch later`,
        on ? "success" : "info"
      );
    } catch (e: any) {
      toast(e.message || "Couldn’t update Watch later.", "error");
    }
  };

  const onRate = async (value: number) => {
    if (!token) {
      toast("Sign in to rate titles.", "error");
      return;
    }
    try {
      await apiAuth(`/user/ratings/${item.id}`, token, {
        method: "POST",
        body: JSON.stringify({ rating: value })
      });
      setRating(value);
      toast(`Rating saved: ${value} star${value === 1 ? "" : "s"}`, "success");
    } catch (e: any) {
      toast(e.message || "Couldn’t save rating.", "error");
    }
  };

  const menuPortal =
    menu &&
    menuPos &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuPortalRef}
        className={styles.menuPortal}
        style={{
          position: "fixed",
          top: menuPos.top,
          left: menuPos.left,
          zIndex: 10050
        }}
      >
        <DropdownMenu
          layout="floating"
          favorite={favorite}
          watchLater={watchLater}
          rating={rating}
          onFavorite={onFavorite}
          onWatchLater={onWatchLater}
          onRate={onRate}
        />
      </div>,
      document.body
    );

  return (
    <article ref={cardRef} className={`${styles.card} ${menu ? styles.cardMenuOpen : ""}`}>
      <button
        ref={dotsRef}
        type="button"
        className={styles.dots}
        onClick={() => setMenu((v) => !v)}
        aria-label="Open actions menu"
        aria-expanded={menu}
      >
        ⋮
      </button>
      {menuPortal}
      <Link className={styles.posterLink} href={`/title/${item.id}?type=${contentType}`}>
        {item.poster_path ? (
          <Image
            className={styles.poster}
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={item.title || item.name || "Poster"}
            width={300}
            height={450}
            sizes="(max-width: 768px) 45vw, (max-width: 1440px) 14vw, 200px"
          />
        ) : (
          <div className={styles.poster} />
        )}
      </Link>
      <div className={styles.meta}>
        <div className={styles.title}>{item.title || item.name}</div>
        <div>{year} · ⭐ {(item.vote_average || 0).toFixed(1)}</div>
        {rating && <div>Your rating: {rating}</div>}
      </div>
    </article>
  );
}
