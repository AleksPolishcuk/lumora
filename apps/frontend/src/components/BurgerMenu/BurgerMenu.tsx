"use client";

import Link from "next/link";
import styles from "./BurgerMenu.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  userName: string;
  plan: "free" | "premium";
  onLogout: () => void | Promise<void>;
}

export function BurgerMenu({ open, onClose, isLoggedIn, userName, plan, onLogout }: Props) {
  if (!open) return null;
  const avatarLetter = (userName?.trim()?.[0] || "U").toUpperCase();
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <Link href="/" onClick={onClose}>Home</Link>
        <Link href="/movies" onClick={onClose}>Movies</Link>
        <Link href="/series" onClick={onClose}>Series</Link>
        <Link href="/cartoons" onClick={onClose}>Cartoons</Link>
        {isLoggedIn && <Link href="/favorites" onClick={onClose}>Favorites</Link>}
        <div className={styles.auth}>
          {!isLoggedIn ? (
            <>
              <Link className={styles.btn} href="/auth/register" onClick={onClose}>Реєстрація</Link>
              <Link className={styles.btn} href="/auth/signin" onClick={onClose}>Логін</Link>
            </>
          ) : (
            <>
              <div className={styles.userMeta}>
                <span className={styles.badge}>Plan: {plan}</span>
                <span className={styles.avatar}>{avatarLetter}</span>
              </div>
              <button
                className={styles.btn}
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
