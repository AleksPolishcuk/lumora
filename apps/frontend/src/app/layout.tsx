import type { Metadata } from "next";
import { Navbar } from "../components/Navbar/Navbar";
import { Providers } from "../components/Providers";
import "./globals.css";

// Avoid static prerender issues on some hosts (e.g. monorepo installs) where client context
// can fail during `next build`. Pages render on the server per request instead.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lumora",
  description: "Streaming platform MVP",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
