import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pravega — Evidence-Verified Placement Intelligence",
  description:
    "One profile. One trail. Every decision explained. Evidence-gated skill verification, closed-loop learning paths, and human-approved AI for college placements.",
  robots: { index: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-color-scheme="light">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
