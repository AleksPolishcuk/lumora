"use client";

/**
 * Root-level error UI. Must include <html> and <body> (plain elements, never next/document).
 * Replaces the root layout when this boundary is active.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0d0d1a",
          color: "#f0eeff",
          fontFamily: "DM Sans, system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          padding: 24
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: "#a09abf", marginBottom: 24 }}>{error.message || "Please try again."}</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(157, 97, 245, 0.8)",
              background: "linear-gradient(90deg, rgba(124, 58, 237, 0.35), rgba(124, 58, 237, 0.55))",
              color: "#fff",
              padding: "10px 22px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
