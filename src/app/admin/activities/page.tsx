import type { Metadata } from "next";
import Link from "next/link";
import { getAllSAPs, getAllASFs, getLinkedSAP } from "@/lib/activity";
import { deleteActivityAction } from "../../admin/actions";

export const metadata: Metadata = {
  title: "Intima Tracker - Manage Activities",
  description: "View and manage all activities.",
};

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

export default async function ManageActivities() {
  const sapActivities = await getAllSAPs();
  const asfActivities = await getAllASFs();
  
  // Pre-fetch all linked SAPs for ASF activities
  const linkedSAPsMap = new Map<string, Awaited<ReturnType<typeof getLinkedSAP>>>();
  await Promise.all(
    asfActivities.map(async (asf) => {
      const linkedSAP = await getLinkedSAP(asf);
      linkedSAPsMap.set(asf.id, linkedSAP);
    })
  );

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="flex items-center justify-end">
        <Link
          href="/admin/activities/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add New Form
        </Link>
      </div>
      {/* SAP Section */}
      <section>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Student Activity Proposals
              </h2>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                SAP
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Activity proposals submitted for review and approval.
            </p>
          </div>
          {/* global Add New Form button above handles creation */}
        </div>

        <div className="mt-6 flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              {sapActivities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2 text-slate-500">No SAP activities found.</p>
                  <Link
                    href="/admin/activities/new"
                    className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Create your first SAP
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden shadow sm:rounded-lg">
                  <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6"
                        >
                          Activity Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                        >
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {sapActivities.map((activity) => (
                        <tr key={activity.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                            <Link
                              href={`/admin/activities/${activity.id}`}
                              className="text-slate-900 hover:text-indigo-600"
                            >
                              {activity.activityName}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            {activity.activityDate
                              ? new Date(activity.activityDate).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(
                                activity.status
                              )}`}
                            >
                              {activity.status}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              href={`/admin/activities/${activity.id}`}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/activities/${activity.id}/edit`}
                              className="text-slate-600 hover:text-slate-900 mr-4"
                            >
                              Edit
                            </Link>
                            <form
                              action={deleteActivityAction}
                              className="inline-block"
                            >
                              <input type="hidden" name="id" value={activity.id} />
                              <button
                                type="submit"
                                className="text-rose-600 hover:text-rose-900"
                              >
                                Delete
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ASF Section */}
      <section>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Activity Summary Forms
              </h2>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                ASF
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Summary reports for completed activities.
            </p>
          </div>
          {/* global Add New Form button above handles creation */}
        </div>

        <div className="mt-6 flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              {asfActivities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="mt-2 text-slate-500">No ASF activities found.</p>
                  <p className="mt-1 text-xs text-slate-400">Create an ASF after completing a SAP activity.</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow sm:rounded-lg">
                  <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6"
                        >
                          Activity Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                        >
                          Linked SAP
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                        >
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {asfActivities.map((activity) => {
                        const linkedSAP = linkedSAPsMap.get(activity.id);
                        return (
                          <tr key={activity.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                              <Link
                                href={`/admin/activities/${activity.id}`}
                                className="text-slate-900 hover:text-indigo-600"
                              >
                                {activity.activityName}
                              </Link>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                              {linkedSAP ? (
                                <Link
                                  href={`/admin/activities/${linkedSAP.id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  {linkedSAP.activityName}
                                </Link>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(
                                  activity.status
                                )}`}
                              >
                                {activity.status}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <Link
                                href={`/admin/activities/${activity.id}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                View
                              </Link>
                              <Link
                                href={`/admin/activities/${activity.id}/edit`}
                                className="text-slate-600 hover:text-slate-900 mr-4"
                              >
                                Edit
                              </Link>
                              <form
                                action={deleteActivityAction}
                                className="inline-block"
                              >
                                <input type="hidden" name="id" value={activity.id} />
                                <button
                                  type="submit"
                                  className="text-rose-600 hover:text-rose-900"
                                >
                                  Delete
                                </button>
                              </form>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
