import type { Metadata } from "next";
import { getActivityById, getLinkedSAP, getLinkedASF } from "@/lib/activity";
import { headers } from "next/headers";
import Link from "next/link";
import CopyButton from "../../components/CopyButton";

type ActivityDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ActivityDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const activity = getActivityById(id);

  return {
    title: activity ? `${activity.activityName} - Admin` : "Activity Not Found",
    description: activity
      ? `View details for: ${activity.activityName}`
      : "The requested activity could not be found.",
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Rejected":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    case "Under Review":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";
    case "Amendments Required":
      return "bg-orange-50 text-orange-700 ring-orange-600/20";
    case "KIV":
      return "bg-purple-50 text-purple-700 ring-purple-600/20";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { id } = await params;
  const activity = getActivityById(id);

  if (!activity) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-md bg-rose-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-rose-800">Activity Not Found</h3>
              <div className="mt-2 text-sm text-rose-700">
                <p>The activity with ID <span className="font-mono font-bold">{id}</span> could not be found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isASF = activity.formType === "ASF";
  const linkedSAP = isASF ? getLinkedSAP(activity) : null;
  const linkedASF = !isASF ? getLinkedASF(activity.id) : null;

  // Build the full tracking URL using the current host
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;
  const trackingUrl = `${baseUrl}/track/${activity.uniqueToken}`;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not set";
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
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/activities"
          className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600"
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
          Back to activities
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {activity.activityName}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  activity.formType === "SAP"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {activity.formType || "SAP"}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(
                  activity.status
                )}`}
              >
                {activity.status}
              </span>
            </div>
          </div>
          <Link
            href={`/admin/activities/${activity.id}/edit`}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
        </div>
      </div>

      {/* Shareable Tracking Link */}
      <div className="mb-8 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Share Tracking Link</h2>
            <p className="mt-1 text-sm text-white/80">
              Share this link with affiliates to let them track the review status of this {activity.formType || "SAP"}.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-white/10 px-4 py-2.5 font-mono text-sm backdrop-blur">
                {trackingUrl}
              </div>
              <CopyButton text={trackingUrl} />
            </div>
            <p className="mt-2 text-xs text-white/60">
              View count: {activity.publicViewCount} views
            </p>
          </div>
        </div>
      </div>

      {/* Activity Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Main Details Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Activity Details</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Activity Date</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(activity.activityDate)}</dd>
            </div>
            {activity.activityType && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Activity Type</dt>
                <dd className="mt-1 text-sm text-slate-900">{activity.activityType}</dd>
              </div>
            )}
            {activity.affiliate && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Affiliate</dt>
                <dd className="mt-1 text-sm text-slate-900">{activity.affiliate}</dd>
              </div>
            )}
            {activity.description && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Description</dt>
                <dd className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{activity.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Linked Forms & Metadata Card */}
        <div className="space-y-6">
          {/* Linked SAP/ASF */}
          {(linkedSAP || linkedASF) && (
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {isASF ? "Linked SAP" : "Activity Summary Form"}
              </h3>
              {linkedSAP && (
                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                  <div>
                    <p className="font-medium text-blue-900">{linkedSAP.activityName}</p>
                    <p className="text-sm text-blue-700">SAP • {linkedSAP.status}</p>
                  </div>
                  <Link
                    href={`/admin/activities/${linkedSAP.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View →
                  </Link>
                </div>
              )}
              {linkedASF && (
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-4">
                  <div>
                    <p className="font-medium text-emerald-900">{linkedASF.activityName}</p>
                    <p className="text-sm text-emerald-700">ASF • {linkedASF.status}</p>
                  </div>
                  <Link
                    href={`/admin/activities/${linkedASF.id}`}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-800"
                  >
                    View →
                  </Link>
                </div>
              )}
              {!isASF && !linkedASF && (
                <p className="text-sm text-slate-500">No ASF has been submitted for this activity yet.</p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Metadata</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-slate-500">Created At</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {new Date(activity.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {new Date(activity.updatedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Tracking Token</dt>
                <dd className="mt-1">
                  <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                    {activity.uniqueToken}
                  </code>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Activity ID</dt>
                <dd className="mt-1">
                  <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                    {activity.id}
                  </code>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
