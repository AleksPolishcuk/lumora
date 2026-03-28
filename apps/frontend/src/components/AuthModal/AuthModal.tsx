"use client";

import { useEffect, useMemo, useState } from "react";
import { api, apiAuth } from "../../lib/api";
import { clearTokens, setTokens } from "../../lib/auth";
import { useToast } from "../../context/ToastContext";
import styles from "./AuthModal.module.css";

type AuthMode = "signin" | "register";

interface Props {
  open: boolean;
  mode?: AuthMode;
  standalone?: boolean;
  onClose?: () => void;
  onAuthSuccess?: (payload: { name: string; plan: "free" | "premium" }) => void;
}

function EyeIcon({ off = false }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      {off && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value);
}

export function AuthModal({ open, mode = "signin", standalone = false, onClose, onAuthSuccess }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<AuthMode>(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => setTab(mode), [mode]);

  useEffect(() => {
    setError("");
    setFailedAttempts(0);
  }, [tab]);

  useEffect(() => {
    if (!open && !standalone) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, standalone, onClose]);

  const title = useMemo(() => (tab === "signin" ? "Sign In" : "Create Account"), [tab]);
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z\d]/.test(password)) score += 1;
    if (score <= 2) return { label: "Weak", value: 34 };
    if (score <= 4) return { label: "Medium", value: 67 };
    return { label: "Strong", value: 100 };
  }, [password]);

  if (!open && !standalone) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email.");
      toast("Please enter a valid email.", "error");
      return;
    }
    if (!isStrongPassword(password)) {
      const msg = "Password must be 8+ chars and include upper/lowercase, number, and symbol.";
      setError(msg);
      toast(msg, "error");
      return;
    }
    if (tab === "register") {
      if (name.trim().length < 2) {
        setError("Name must be at least 2 characters.");
        toast("Name must be at least 2 characters.", "error");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        toast("Passwords do not match.", "error");
        return;
      }
    }

    try {
      setLoading(true);
      if (tab === "signin") {
        const res = await api<{ accessToken: string; refreshToken: string; user: { name: string } }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: normalizedEmail, password })
        });
        setTokens(res.accessToken, res.refreshToken);
        const sub = await apiAuth<{ subscription: { plan: "free" | "premium" } }>("/user/subscription", res.accessToken);
        onAuthSuccess?.({ name: res.user.name, plan: sub.subscription.plan || "free" });
        toast(`Welcome back, ${res.user.name || "friend"}!`, "success");
      } else {
        const res = await api<{ accessToken: string; refreshToken: string; user: { name: string; subscription?: { plan: "free" | "premium" } } }>(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password, plan })
          }
        );
        setTokens(res.accessToken, res.refreshToken);
        onAuthSuccess?.({ name: res.user.name, plan: res.user.subscription?.plan || plan });
        const planLabel = (res.user.subscription?.plan || plan) === "premium" ? "Premium" : "Free";
        toast(`Account ready — ${planLabel} plan. Welcome to Lumora!`, "success");
      }
      setFailedAttempts(0);
      onClose?.();
    } catch (err: any) {
      if (tab === "signin") setFailedAttempts((prev) => prev + 1);
      if (String(err.message).toLowerCase().includes("invalid credentials")) {
        setError("Invalid email or password.");
        toast("Invalid email or password.", "error");
      } else {
        const msg = err.message || "Authentication failed.";
        setError(msg);
        toast(msg, "error");
      }
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => onClose?.()}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {!standalone && <button className={styles.close} onClick={() => onClose?.()}>×</button>}
        </div>
        <div className={styles.tabs}>
          <button className={`${styles.tabBtn} ${tab === "signin" ? styles.tabActive : ""}`} onClick={() => setTab("signin")}>Sign In</button>
          <button className={`${styles.tabBtn} ${tab === "register" ? styles.tabActive : ""}`} onClick={() => setTab("register")}>Register</button>
        </div>
        <form className={styles.form} onSubmit={submit}>
          {tab === "register" && (
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
          )}
          <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" />
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete={tab === "register" ? "new-password" : "current-password"}
            />
            <button
              type="button"
              className={styles.eye}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon off={showPassword} />
            </button>
          </div>
          {tab === "register" && (
            <div className={styles.strength}>
              <div className={styles.strengthBar}>
                <div className={styles.strengthFill} style={{ width: `${passwordStrength.value}%` }} />
              </div>
              <span className={styles.hint}>Password strength: {passwordStrength.label}</span>
            </div>
          )}
          {tab === "register" && (
            <>
              <div className={styles.passwordWrap}>
                <input
                  className={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  <EyeIcon off={showConfirmPassword} />
                </button>
              </div>
              <div className={styles.plans}>
                <button type="button" className={`${styles.plan} ${plan === "free" ? styles.planActive : ""}`} onClick={() => setPlan("free")}>
                  <strong>Free</strong>
                  <div className={styles.hint}>Basic access</div>
                </button>
                <button type="button" className={`${styles.plan} ${plan === "premium" ? styles.planActive : ""}`} onClick={() => setPlan("premium")}>
                  <strong>Premium</strong>
                  <div className={styles.hint}>Full access</div>
                </button>
              </div>
            </>
          )}
          <div className={styles.hint}>We encrypt passwords with secure hashing before storage.</div>
          {tab === "signin" && failedAttempts >= 3 && (
            <div className={styles.lockHint}>
              Multiple failed attempts detected. Please double-check credentials or reset password later.
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.submit} disabled={loading} type="submit">
            {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
