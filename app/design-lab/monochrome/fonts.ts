import { Inter, JetBrains_Mono } from "next/font/google";

// Direction 06 — shared font instances (self-hosted at build time).
export const inter = Inter({ subsets: ["latin"] });
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
