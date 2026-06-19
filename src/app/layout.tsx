import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Providers from "@/components/layout/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ESHOP - Streetwear & Accessori",
    template: "%s | ESHOP",
  },
  description:
    "La tua destinazione per streetwear di tendenza e accessori unici. Qualità, stile e originalità in ogni pezzo.",
  keywords: ["streetwear", "moda", "accessori", "cappelli", "online", "shop"],
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "ESHOP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
