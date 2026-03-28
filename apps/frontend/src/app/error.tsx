"use client";

import Link from "next/link";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: "2rem", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display, serif)", marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ color: "var(--lumora-text-sec)", marginBottom: 20 }}>{error.message || "An unexpected error occurred."}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(157, 97, 245, 0.8)",
            background: "linear-gradient(90deg, rgba(124, 58, 237, 0.35), rgba(124, 58, 237, 0.55))",
            color: "#fff",
            padding: "10px 18px",
            cursor: "pointer"
          }}
        >
          Try again
        </button>
        <Link href="/" style={{ color: "#b78bff", alignSelf: "center" }}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
