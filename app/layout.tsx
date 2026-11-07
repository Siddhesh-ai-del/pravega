import type { Metadata } from "next";
import { Fira_Sans, Fira_Sans_Condensed } from "next/font/google";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const firaCondensed = Fira_Sans_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-head",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pravega — Evidence-Verified Placement Intelligence",
  description:
    "One profile. One trail. Every decision explained. Evidence-gated skill verification, closed-loop learning paths, and human-approved AI for college placements.",
  robots: { index: false },
  icons: {
    icon: "/mark.svg",
    apple: "/mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${firaSans.variable} ${firaCondensed.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
