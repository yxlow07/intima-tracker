import type { Metadata } from "next";
import { getActivityById, updateActivity, getLinkedSAP } from "@/lib/activity";
import { redirect } from "next/navigation";
import Link from "next/link";

type EditActivityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: EditActivityPageProps): Promise<Metadata> {
  const { id } = await params;
  const activity = getActivityById(id);

  return {
    title: activity ? `Edit Activity - ${activity.activityName}` : "Edit Activity",
    description: activity
      ? `Edit the details of activity: ${activity.activityName}.`
      : "Edit an existing activity.",
  };
}

export default async function EditActivityPage({
  params,
}: EditActivityPageProps) {
  const { id } = await params;
  const activity = getActivityById(id);
  const isASF = activity?.formType === "ASF";
  const linkedSAP = isASF && activity ? getLinkedSAP(activity) : null;

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

  async function handleSubmit(formData: FormData) {
    "use server";

    const activityName = formData.get("activityName") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const activityDate = formData.get("activityDate") as string;
    const activityType = formData.get("activityType") as string;
    const affiliate = formData.get("affiliate") as string;

    updateActivity(id, {
      activityName,
      description,
      status,
      activityDate,
      activityType,
      affiliate,
    });

    redirect("/admin/activities");
  }

  // Helper to format date for datetime-local input
  const formatDateTimeForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
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
          <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Activity
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                activity.formType === "SAP"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {activity.formType || "SAP"}
            </span>
            {linkedSAP && (
              <span className="text-sm text-slate-500">
                Linked to: <span className="font-medium text-slate-700">{linkedSAP.activityName}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {isASF && (
        <div className="mb-6 rounded-lg bg-amber-50 p-4 ring-1 ring-amber-200">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Activity Summary Form</h3>
              <div className="mt-1 text-sm text-amber-700">
                <p>Activity details are inherited from the linked SAP and cannot be edited. Only the status can be changed.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="activityName"
                className="block text-sm font-medium text-slate-700"
              >
                Activity Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="activityName"
                  id="activityName"
                  required
                  readOnly={isASF}
                  defaultValue={activity.activityName}
                  className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    isASF ? "bg-slate-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  readOnly={isASF}
                  defaultValue={activity.description || ""}
                  className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    isASF ? "bg-slate-50 cursor-not-allowed" : ""
                  }`}
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="activityDate"
                  className="block text-sm font-medium text-slate-700"
                >
                  Activity Date
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    name="activityDate"
                    id="activityDate"
                    readOnly={isASF}
                    defaultValue={formatDateTimeForInput(activity.activityDate)}
                    className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      isASF ? "bg-slate-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="activityType"
                  className="block text-sm font-medium text-slate-700"
                >
                  Activity Type
                </label>
                <div className="mt-1">
                  {isASF ? (
                    <input
                      type="text"
                      name="activityType"
                      id="activityType"
                      readOnly
                      defaultValue={activity.activityType || ""}
                      className="block w-full rounded-lg border-slate-300 shadow-sm bg-slate-50 cursor-not-allowed sm:text-sm"
                    />
                  ) : (
                    <select
                      id="activityType"
                      name="activityType"
                      defaultValue={activity.activityType || ""}
                      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select type...</option>
                      <option value="Sports">Sports</option>
                      <option value="Charitable">Charitable</option>
                      <option value="Non-Charitable">Non-Charitable</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="affiliate"
                className="block text-sm font-medium text-slate-700"
              >
                Affiliate
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="affiliate"
                  id="affiliate"
                  readOnly={isASF}
                  defaultValue={activity.affiliate || ""}
                  className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    isASF ? "bg-slate-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue={activity.status}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Amendments Required">Amendments Required</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="KIV">KIV</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Update Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}