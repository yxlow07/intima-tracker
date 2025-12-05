import type { Metadata } from "next";
import { getActivityById } from "@/lib/activity";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type ActivityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ActivityPageProps): Promise<Metadata> {
  const { id } = await params;
  const activity = await getActivityById(id);

  return {
    title: activity ? `${activity.activityName} - Intima Tracker` : "Activity Not Found",
    description: activity
      ? `View details for: ${activity.activityName}`
      : "The requested activity could not be found.",
  };
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) {
    return (
      <div className="min-h-[80vh] bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <svg
                className="h-6 w-6 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-slate-900">
              Activity Not Found
            </h2>
            <p className="mt-2 text-slate-500">
              The activity could not be found.
            </p>
            <div className="mt-6">
              <Link
                href="/calendar"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                View Calendar
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-[80vh] bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/calendar"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Calendar
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {activity.activityName}
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Date */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <svg
                    className="h-5 w-5 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Date & Time</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {formatDate(activity.activityDate)}
                  </p>
                </div>
              </div>

              {/* Type */}
              {activity.activityType && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                    <svg
                      className="h-5 w-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Activity Type</p>
                    <p className="mt-1 text-sm text-slate-900">{activity.activityType}</p>
                  </div>
                </div>
              )}

              {/* Affiliate */}
              {activity.affiliate && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <svg
                      className="h-5 w-5 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Affiliate</p>
                    <p className="mt-1 text-sm text-slate-900">{activity.affiliate}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {activity.description && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="text-sm font-medium text-slate-500 mb-3">Description</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{activity.description}</p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              For form review status, please use your unique tracking link.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
