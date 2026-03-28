"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthModal } from "../../../components/AuthModal/AuthModal";
import { safeRedirectPath } from "../../../lib/safeRedirect";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"));

  return (
    <AuthModal
      open={true}
      mode="register"
      standalone={true}
      onClose={() => router.push("/")}
      onAuthSuccess={() => router.push(redirect)}
    />
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "50vh", padding: 24, color: "var(--lumora-text-sec)" }}>
          Loading…
        </main>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
