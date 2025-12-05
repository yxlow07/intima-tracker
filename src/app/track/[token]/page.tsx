import type { Metadata } from "next";
import { getActivityByToken, getLinkedSAP, getLinkedASF } from "@/lib/activity";
import Link from "next/link";
import StatusProgressBar from "@/components/StatusProgressBar";
import CollapsibleDetails from "@/components/CollapsibleDetails";
import Navbar from "@/components/Navbar";

type TrackingPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export async function generateMetadata({
  params,
}: TrackingPageProps): Promise<Metadata> {
  const { token } = await params;
  const activity = await getActivityByToken(token);

  return {
    title: activity ? `Activity Status - ${activity.activityName}` : "Activity Not Found",
    description: activity
      ? `Track the status of your activity: ${activity.activityName}.`
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

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;
  const activity = await getActivityByToken(token);
  
  // Get linked SAP (if this is an ASF) or linked ASF (if this is a SAP)
  const linkedSAP = activity?.formType === "ASF" ? await getLinkedSAP(activity) : null;
  const linkedASF = activity?.formType === "SAP" ? await getLinkedASF(activity.id) : null;

  // Determine which status to display in the progress bar
  // If viewing a SAP and there's a linked ASF, show the ASF status
  // Otherwise show the current activity's status
  const displayStatus = linkedASF ? linkedASF.status : activity?.status || "Pending";
  const displayFormType = linkedASF ? "ASF" : activity?.formType || "SAP";

  if (!activity) {
    return (
      <div className="min-h-[80vh]">
        <Navbar currentPage="tracking" />
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
              The activity with token <span className="font-mono text-rose-600">{token}</span> could not be found.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Go back home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh]">
      <Navbar currentPage="tracking" />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Tracking Details
          </h2>
        </div>

        {/* Status Progress Bar */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-12">
          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold text-slate-800">Application Status</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tracking: <span className={`font-medium ${displayFormType === "ASF" ? "text-emerald-600" : "text-blue-600"}`}>{displayFormType}</span>
              {linkedASF && <span className="text-slate-400"> (ASF submitted)</span>}
            </p>
          </div>
          <StatusProgressBar status={displayStatus} />
        </div>

        {/* Activity Details - Collapsible */}
        <CollapsibleDetails title="More Details" defaultOpen={false}>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {/* ASF Alert */}
            {linkedASF && (
              <div className="sm:col-span-2 rounded-lg bg-emerald-50 border border-emerald-200 p-4 mb-2">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Activity Summary Form (ASF) Submitted</p>
                    <p className="text-sm text-emerald-700 mt-1">An ASF has been submitted for this activity. The progress above shows the ASF status.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              {linkedASF ? null : (
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      activity.formType === "SAP"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {activity.formType || "SAP"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(
                      activity.status
                    )}`}
                  >
                    {activity.status}
                  </span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Activity Name</dt>
              <dd className="mt-1 text-lg font-medium text-slate-900">{activity.activityName}</dd>
            </div>
            
            {/* Linked SAP/ASF info */}
            {linkedSAP && (
              <div className="sm:col-span-2 rounded-lg bg-blue-50 p-4">
                <dt className="text-sm font-medium text-blue-800">Linked SAP</dt>
                <dd className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-blue-900">{linkedSAP.activityName}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(
                      linkedSAP.status
                    )}`}
                  >
                    {linkedSAP.status}
                  </span>
                </dd>
              </div>
            )}
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Description</dt>
              <dd className="mt-1 text-base text-slate-700">
                {activity.description || "No description provided."}
              </dd>
            </div>

            {activity.activityDate && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Activity Date</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {new Date(activity.activityDate).toLocaleString()}
                </dd>
              </div>
            )}

            {activity.activityType && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Activity Type</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {activity.activityType}
                </dd>
              </div>
            )}

            {activity.affiliate && (
              <div className="">
                <dt className="text-sm font-medium text-slate-500">Affiliate</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {activity.affiliate}
                </dd>
              </div>
            )}

            {
              linkedASF ? (
                <div>
                  <dt className="text-sm font-medium text-slate-500">SAP Status</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    <span className={`font-medium inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ring-1 ring-inset ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </dd>
                </div>
              ) : null
            }

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
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Unique Tracking Token</dt>
              <dd className="mt-1 flex items-center gap-2">
                <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm text-slate-700">
                  {activity.uniqueToken}
                </code>
                <span className="text-xs text-slate-400">(Keep this safe)</span>
              </dd>
            </div>
          </dl>
        </CollapsibleDetails>
      </main>
    </div>
  );
}