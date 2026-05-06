import type { Metadata } from "next";
import { Syne, JetBrains_Mono, Spectral } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LangProvider } from "@/i18n/LangProvider";

const display = Syne({ variable: "--font-display", subsets: ["latin"], weight: ["400","500","600","700","800"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400","500"] });
const serif = Spectral({ variable: "--font-serif", subsets: ["latin"], weight: ["400","500"], style: ["normal","italic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://chaos-os.psyverse.fun"),
  title: "Chaos OS | 混沌操作系统",
  description: "A system to understand complexity, emergence, and nonlinear dynamics. Butterfly effect, strange attractors, Game of Life emergence, feedback loops, and phase transitions. 蝴蝶效应、奇异吸引子、生命游戏涌现、反馈环路与相变的交互探索系统。",
  keywords: ["chaos theory","complexity","emergence","nonlinear","butterfly effect","feedback loops","phase transition","混沌理论","复杂性","涌现","非线性","蝴蝶效应"],
  authors: [{ name: "Gewenbo", url: "https://psyverse.fun" }],
  alternates: { canonical: "/", languages: { en: "/", "zh-CN": "/", "x-default": "/" } },
  openGraph: {
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Chaos OS · 混沌操作系统" }], title: "Chaos OS", description: "Complexity, emergence, and nonlinear dynamics.", url: "https://chaos-os.psyverse.fun/", siteName: "Psyverse", type: "website" },
  twitter: {
    images: ["/twitter-image.png"], card: "summary_large_image", title: "Chaos OS", description: "A system to understand complexity and emergence." },
  robots: { index: true, follow: true },
  other: { "theme-color": "#040810" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Script src="https://analytics-dashboard-two-blue.vercel.app/tracker.js" strategy="afterInteractive" />
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
