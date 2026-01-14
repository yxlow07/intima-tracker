import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#f8fafc",
};

export const metadata: Metadata = {
  title: "Intima Tracker",
  description: "Track the status of your activities.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Intima Tracker",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192x192.png",
    shortcut: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
