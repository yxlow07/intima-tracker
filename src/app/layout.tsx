import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
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
    icon: "/android/android-launchericon-192-192.png",
    shortcut: "/android/android-launchericon-192-192.png",
    apple: "/ios/192.png",
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
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
