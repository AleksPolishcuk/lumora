import type { Metadata } from "next";
import { Navbar } from "../components/Navbar/Navbar";
import { Providers } from "../components/Providers";
import "./globals.css";

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
