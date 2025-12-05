"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

type AffiliateIdea = {
  id: string;
  affiliateName: string;
  description?: string;
  positionsOpen?: string[] | string;
  contact: string;
  studentEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function parsePositions(positionsOpen?: string[] | string): string[] {
  if (!positionsOpen) return [];
  // If it's already an array (MongoDB), return it directly
  if (Array.isArray(positionsOpen)) return positionsOpen;
  // Fallback for legacy string data
  try {
    return JSON.parse(positionsOpen);
  } catch {
    return [];
  }
}

export default function AffiliateIdeasPage() {
  const [ideas, setIdeas] = useState<AffiliateIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<AffiliateIdea | null>(null);

  // Form state
  const [affiliateName, setAffiliateName] = useState("");
  const [description, setDescription] = useState("");
  const [positionsOpen, setPositionsOpen] = useState<string[]>([""]);
  const [contact, setContact] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await fetch("/api/affiliate-ideas");
      const data = await res.json();
      setIdeas(data);
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPosition = () => {
    setPositionsOpen([...positionsOpen, ""]);
  };

  const handleRemovePosition = (index: number) => {
    setPositionsOpen(positionsOpen.filter((_, i) => i !== index));
  };

  const handlePositionChange = (index: number, value: string) => {
    const newPositions = [...positionsOpen];
    newPositions[index] = value;
    setPositionsOpen(newPositions);
  };

  const resetForm = () => {
    setAffiliateName("");
    setDescription("");
    setPositionsOpen([""]);
    setContact("");
    setStudentEmail("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/affiliate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateName,
          description,
          positionsOpen: positionsOpen.filter((p) => p.trim()),
          contact,
          studentEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit idea");
      }

      setSuccess(true);
      resetForm();
      fetchIdeas();
      
      // Close modal after showing success briefly
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit idea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentPage="ideas" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Affiliate Ideas Board
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-500">Loading ideas...</div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200">
            <svg
              className="mx-auto h-16 w-16 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">No ideas yet</h3>
            <p className="mt-2 text-slate-500">Be the first to pitch an affiliate idea!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => {
              const positions = parsePositions(idea.positionsOpen);
              return (
                <button
                  key={idea.id}
                  onClick={() => setSelectedIdea(idea)}
                  className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden hover:shadow-md transition-shadow text-left cursor-pointer"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {idea.affiliateName}
                    </h3>
                    {idea.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                        {idea.description}
                      </p>
                    )}
                    
                    {positions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                          Positions Open
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {positions.slice(0, 3).map((position, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                            >
                              {position}
                            </span>
                          ))}
                          {positions.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                              +{positions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Contact</p>
                      <p className="text-sm font-medium text-slate-900">{idea.contact}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all hover:scale-110"
        title="Pitch a new idea"
      >
        <svg
          className="h-8 w-8 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Read More Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/50 transition-opacity"
              onClick={() => setSelectedIdea(null)}
            />

            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedIdea.affiliateName}
                </h3>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedIdea.description && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">About</p>
                    <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
                      {selectedIdea.description}
                    </p>
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
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/50 transition-opacity"
              onClick={() => {
                if (!isSubmitting) {
                  setShowModal(false);
                  resetForm();
                }
              }}
            />

            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              {success ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-900">
                    Idea Submitted!
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your idea has been submitted for approval. It will appear on the board once approved.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-5 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">
                      Pitch Your Affiliate Idea
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Share your vision and find like-minded people.
                    </p>
                  </div>

                  <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {error && (
                      <div className="rounded-lg bg-red-50 p-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="affiliateName"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Affiliate Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="affiliateName"
                        required
                        value={affiliateName}
                        onChange={(e) => setAffiliateName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., Photography Society"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="What is your affiliate about? What activities do you plan to do?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Positions Open
                      </label>
                      <div className="space-y-2">
                        {positionsOpen.map((position, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={position}
                              onChange={(e) => handlePositionChange(index, e.target.value)}
                              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="e.g., Vice President"
                            />
                            {positionsOpen.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePosition(index)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
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
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add position
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor="contact"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Contact Information <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="contact"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., WhatsApp: 012-3456789"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="studentEmail"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Student Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="studentEmail"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Your student email"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        We use this to verify you are a student.
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      disabled={isSubmitting}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Idea"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
