"use client";

import { useState, useEffect } from "react";

type AffiliateIdea = {
  id: string;
  affiliateName: string;
  description?: string;
  positionsOpen?: string;
  contact: string;
  studentEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function parsePositions(positionsOpen?: string): string[] {
  if (!positionsOpen) return [];
  try {
    return JSON.parse(positionsOpen);
  } catch {
    return [];
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Rejected":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
}

export default function AdminAffiliateIdeasPage() {
  const [ideas, setIdeas] = useState<AffiliateIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<AffiliateIdea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editAffiliateName, setEditAffiliateName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPositionsOpen, setEditPositionsOpen] = useState<string[]>([""]);
  const [editContact, setEditContact] = useState("");
  const [editStudentEmail, setEditStudentEmail] = useState("");
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await fetch("/api/affiliate-ideas?all=true");
      const data = await res.json();
      setIdeas(data);
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditMode = (idea: AffiliateIdea) => {
    setEditAffiliateName(idea.affiliateName);
    setEditDescription(idea.description || "");
    const positions = parsePositions(idea.positionsOpen);
    setEditPositionsOpen(positions.length > 0 ? positions : [""]);
    setEditContact(idea.contact);
    setEditStudentEmail(idea.studentEmail);
    setEditStatus(idea.status);
    setIsEditing(true);
  };

  const closeEditMode = () => {
    setIsEditing(false);
  };

  const handleAddPosition = () => {
    setEditPositionsOpen([...editPositionsOpen, ""]);
  };

  const handleRemovePosition = (index: number) => {
    setEditPositionsOpen(editPositionsOpen.filter((_, i) => i !== index));
  };

  const handlePositionChange = (index: number, value: string) => {
    const newPositions = [...editPositionsOpen];
    newPositions[index] = value;
    setEditPositionsOpen(newPositions);
  };

  const saveEdit = async () => {
    if (!selectedIdea) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/affiliate-ideas/${selectedIdea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateName: editAffiliateName,
          description: editDescription,
          positionsOpen: editPositionsOpen.filter((p) => p.trim()),
          contact: editContact,
          studentEmail: editStudentEmail,
          status: editStatus,
        }),
      });

      if (res.ok) {
        const updatedIdea = await res.json();
        setSelectedIdea(updatedIdea);
        setIsEditing(false);
        fetchIdeas();
      }
    } catch (err) {
      console.error("Failed to save idea:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/affiliate-ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchIdeas();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(null);
    }
  };

  const deleteIdea = async (id: string) => {
    if (!confirm("Are you sure you want to delete this idea?")) return;
    
    try {
      const res = await fetch(`/api/affiliate-ideas/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchIdeas();
        setSelectedIdea(null);
      }
    } catch (err) {
      console.error("Failed to delete idea:", err);
    }
  };

  const pendingIdeas = ideas.filter((i) => i.status === "Pending Approval");
  const approvedIdeas = ideas.filter((i) => i.status === "Approved");
  const rejectedIdeas = ideas.filter((i) => i.status === "Rejected");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          Affiliate Ideas
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Review and manage affiliate idea submissions from students.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500">Loading ideas...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Approval Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Pending Approval</h3>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {pendingIdeas.length}
              </span>
            </div>

            {pendingIdeas.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500">No pending ideas to review.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow sm:rounded-lg">
                <table className="min-w-full divide-y divide-slate-300">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                        Affiliate Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                        Submitted By
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                        Date
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {pendingIdeas.map((idea) => (
                      <tr key={idea.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                          <button
                            onClick={() => setSelectedIdea(idea)}
                            className="hover:text-indigo-600"
                          >
                            {idea.affiliateName}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {idea.studentEmail}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {new Date(idea.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                          <button
                            onClick={() => {
                              setSelectedIdea(idea);
                              openEditMode(idea);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => updateStatus(idea.id, "Approved")}
                            disabled={updating === idea.id}
                            className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(idea.id, "Rejected")}
                            disabled={updating === idea.id}
                            className="text-rose-600 hover:text-rose-900 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Approved Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Approved</h3>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {approvedIdeas.length}
              </span>
            </div>

            {approvedIdeas.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500">No approved ideas yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow sm:rounded-lg">
                <table className="min-w-full divide-y divide-slate-300">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                        Affiliate Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                        Submitted By
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {approvedIdeas.map((idea) => (
                      <tr key={idea.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                          <button
                            onClick={() => setSelectedIdea(idea)}
                            className="hover:text-indigo-600"
                          >
                            {idea.affiliateName}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {idea.studentEmail}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(idea.status)}`}>
                            {idea.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                          <button
                            onClick={() => {
                              setSelectedIdea(idea);
                              openEditMode(idea);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => updateStatus(idea.id, "Pending Approval")}
                            disabled={updating === idea.id}
                            className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                          <button
                            onClick={() => deleteIdea(idea.id)}
                            className="text-rose-600 hover:text-rose-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Rejected Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Rejected</h3>
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                {rejectedIdeas.length}
              </span>
            </div>

            {rejectedIdeas.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500">No rejected ideas.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow sm:rounded-lg">
                <table className="min-w-full divide-y divide-slate-300">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                        Affiliate Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                        Submitted By
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {rejectedIdeas.map((idea) => (
                      <tr key={idea.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                          <button
                            onClick={() => setSelectedIdea(idea)}
                            className="hover:text-indigo-600"
                          >
                            {idea.affiliateName}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {idea.studentEmail}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(idea.status)}`}>
                            {idea.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                          <button
                            onClick={() => {
                              setSelectedIdea(idea);
                              openEditMode(idea);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => updateStatus(idea.id, "Approved")}
                            disabled={updating === idea.id}
                            className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => deleteIdea(idea.id)}
                            className="text-rose-600 hover:text-rose-900">
                            Delete
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Detail/Edit Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/50 transition-opacity"
              onClick={() => {
                setSelectedIdea(null);
                setIsEditing(false);
              }}
            />

            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <h3 className="text-lg font-bold text-slate-900">
                      Edit Idea
                    </h3>
                  ) : (
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedIdea.affiliateName}
                    </h3>
                  )}
                  {!isEditing && (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(selectedIdea.status)}`}>
                      {selectedIdea.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {isEditing ? (
                  <>
                    {/* Edit Form */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Affiliate Name
                      </label>
                      <input
                        type="text"
                        value={editAffiliateName}
                        onChange={(e) => setEditAffiliateName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Positions Open
                      </label>
                      <div className="space-y-2">
                        {editPositionsOpen.map((position, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={position}
                              onChange={(e) => handlePositionChange(index, e.target.value)}
                              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="e.g., Vice President"
                            />
                            {editPositionsOpen.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePosition(index)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPosition}
                        className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add position
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Contact
                      </label>
                      <input
                        type="text"
                        value={editContact}
                        onChange={(e) => setEditContact(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Student Email
                      </label>
                      <input
                        type="email"
                        value={editStudentEmail}
                        onChange={(e) => setEditStudentEmail(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {/* View Mode */}
                    {selectedIdea.description && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">Description</p>
                        <p className="mt-1 text-sm text-slate-900">{selectedIdea.description}</p>
                      </div>
                    )}

                    {parsePositions(selectedIdea.positionsOpen).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">Positions Open</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {parsePositions(selectedIdea.positionsOpen).map((position, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                            >
                              {position}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-slate-500">Contact</p>
                      <p className="mt-1 text-sm text-slate-900">{selectedIdea.contact}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500">Student Email</p>
                      <p className="mt-1 text-sm text-slate-900">{selectedIdea.studentEmail}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Created</p>
                        <p className="mt-1 text-sm text-slate-900">
                          {new Date(selectedIdea.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Last Updated</p>
                        <p className="mt-1 text-sm text-slate-900">
                          {new Date(selectedIdea.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
                {isEditing ? (
                  <>
                    <button
                      onClick={closeEditMode}
                      disabled={isSaving}
                      className="text-sm font-medium text-slate-600 hover:text-slate-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={isSaving}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => deleteIdea(selectedIdea.id)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditMode(selectedIdea)}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      {selectedIdea.status !== "Approved" && (
                        <button
                          onClick={() => {
                            updateStatus(selectedIdea.id, "Approved");
                            setSelectedIdea(null);
                          }}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      )}
                      {selectedIdea.status !== "Rejected" && (
                        <button
                          onClick={() => {
                            updateStatus(selectedIdea.id, "Rejected");
                            setSelectedIdea(null);
                          }}
                          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedIdea(null)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
