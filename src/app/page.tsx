import type { Metadata } from "next";
import Link from "next/link";
import TrackingInput from "@/components/TrackingInput";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Intima Tracker - Activity Dashboard",
  description: "Track your activity status with your tracking ID.",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar currentPage="dashboard" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section with Tracking Input */}
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Track Your Activity
          </h2>
          
          {/* Tracking ID Input */}
          <div className="mt-8 w-full max-w-md lg:max-w-xl">
            <TrackingInput />
          </div>

          <p className="mt-8 text-sm text-slate-500">
            View all scheduled activities in the{" "}
            <Link href="/calendar" className="font-medium text-indigo-600 hover:text-indigo-500">
              Calendar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
