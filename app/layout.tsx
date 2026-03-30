import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 LAUNCH METADATA
export const metadata: Metadata = {
  title: "unjargon.",
  description: "Demystifying tech terminology for designers through analogies. Built by Zain.",
  icons: {
    icon: "/favicon.ico?v=2", // 👈 The "Cache Buster" that forces the browser to update
  },
  openGraph: {
    title: "unjargon.",
    description: "The designer's secret weapon for understanding developer-speak.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full", 
        "antialiased", 
        geistSans.variable, 
        geistMono.variable, 
        jetbrainsMono.variable,
        "font-mono" 
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}