import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Pravega — The Verifying Ledger",
  description:
    "One profile. One trail. Every decision explained. Evidence-gated skill verification, closed-loop learning paths, and human-approved AI for college placements.",
  robots: { index: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-color-scheme="dark" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
