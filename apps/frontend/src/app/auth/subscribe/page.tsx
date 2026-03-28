"use client";

import { api } from "../../../lib/api";
import { getAccessToken } from "../../../lib/auth";
import { useToast } from "../../../context/ToastContext";
import styles from "../../BrowsePage.module.css";

export default function SubscribePage() {
  const { toast } = useToast();
  const subscribe = async (plan: "free" | "premium") => {
    const token = getAccessToken();
    if (!token) {
      toast("Sign in to change your plan.", "error");
      return;
    }
    try {
      await api("/user/subscribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan })
      });
      toast(`Plan updated to ${plan === "premium" ? "Premium" : "Free"}.`, "success");
    } catch (e: any) {
      toast(e.message || "Couldn’t update plan.", "error");
    }
  };
  return (
    <main className={styles.page}>
      <h1>Subscription</h1>
      <button onClick={() => subscribe("free")}>Free</button>
      <button onClick={() => subscribe("premium")}>Premium</button>
    </main>
  );
}
