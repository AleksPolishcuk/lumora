"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { BurgerMenu } from "../BurgerMenu/BurgerMenu";
import { AuthModal } from "../AuthModal/AuthModal";
import styles from "./Navbar.module.css";
import { apiAuth } from "../../lib/api";
import { clearTokens, getAccessToken } from "../../lib/auth";
import { useToast } from "../../context/ToastContext";

export function Navbar() {
  const { toast } = useToast();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    Promise.all([
      apiAuth<{ user: { name: string } }>("/auth/me", token),
      apiAuth<{ subscription: { plan: "free" | "premium" } }>("/user/subscription", token)
    ])
      .then(([me, sub]) => {
        setIsLoggedIn(true);
        setUserName(me.user?.name || "");
        setPlan(sub.subscription?.plan || "free");
      })
      .catch(() => {
        clearTokens();
        setIsLoggedIn(false);
      });
  }, []);

  const avatarLetter = useMemo(() => (userName?.trim()?.[0] || "U").toUpperCase(), [userName]);

  const onLogout = async () => {
    const token = getAccessToken();
    if (token) {
      try {
        await apiAuth("/auth/logout", token, { method: "POST" });
      } catch (_err) {
      }
    }
    clearTokens();
    setIsLoggedIn(false);
    setUserName("");
    setPlan("free");
    toast("You’ve been signed out.", "info");
    window.setTimeout(() => {
      window.location.href = "/";
    }, 520);
  };

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? `${styles.navScrolled} ${styles.navFilled}` : ""}`}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label="Lumora home">
            <span className={styles.brandText}>Lumora</span>
            <span className={styles.brandSpark} aria-hidden="true">✦</span>
          </Link>
          <div className={styles.links}>
            {[
              { href: "/", label: "Home" },
              { href: "/movies", label: "Movies" },
              { href: "/series", label: "Series" },
              { href: "/cartoons", label: "Cartoons" },
              ...(isLoggedIn ? [{ href: "/favorites", label: "Favorites" as const }] : [])
            ].map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className={styles.actions}>
            {!isLoggedIn ? (
              <>
                <button
                  className={styles.btn}
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthOpen(true);
                  }}
                >
                  Sign In
                </button>
                <button
                  className={styles.btn}
                  onClick={() => {
                    setAuthMode("register");
                    setAuthOpen(true);
                  }}
                >
                  Subscribe
                </button>
              </>
            ) : (
              <>
                <span className={styles.badge}>Plan: {plan}</span>
                <span className={styles.avatar}>{avatarLetter}</span>
                <button className={styles.btn} onClick={onLogout}>Logout</button>
              </>
            )}
          </div>
          <button className={styles.burger} onClick={() => setOpen(true)}>Menu</button>
        </div>
      </nav>
      <BurgerMenu
        open={open}
        onClose={() => setOpen(false)}
        isLoggedIn={isLoggedIn}
        userName={userName}
        plan={plan}
        onLogout={onLogout}
      />
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={({ name, plan: userPlan }) => {
          setIsLoggedIn(true);
          setUserName(name || "User");
          setPlan(userPlan || "free");
        }}
      />
    </>
  );
}
