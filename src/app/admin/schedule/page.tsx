"use client";

import { useState, useEffect } from "react";

type TimeSlot = {
  start: string;
  end: string;
};

type WeeklySchedule = {
  Monday: TimeSlot[];
  Tuesday: TimeSlot[];
  Wednesday: TimeSlot[];
  Thursday: TimeSlot[];
  Friday: TimeSlot[];
};

type MemberSchedule = {
  id: string;
  name: string;
  session: string;
  schedule: WeeklySchedule;
  createdAt: string;
  updatedAt: string;
};

type ScheduleSlot = {
  id: string;
  day: keyof WeeklySchedule;
  start: string;
  end: string;
  assignedMembers: string[];
  session: string;
  createdAt: string;
  updatedAt: string;
};

const DAYS: (keyof WeeklySchedule)[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
];

export default function SchedulePage() {
  const [members, setMembers] = useState<MemberSchedule[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Upload form state
  const [uploadName, setUploadName] = useState("");
  const [uploadSession, setUploadSession] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newSessionInput, setNewSessionInput] = useState("");

  // Track dropdown state for each slot
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const [availableMembers, setAvailableMembers] = useState<Record<string, MemberSchedule[]>>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [previewImageData, setPreviewImageData] = useState<{ data: string; filename: string } | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/schedule?type=sessions");
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  const fetchScheduleData = async () => {
    setLoading(true);
    // Clear cached available members and dropdown states when switching sessions
    setAvailableMembers({});
    setDropdownStates({});
    try {
      const [membersRes, slotsRes] = await Promise.all([
        fetch(`/api/schedule?type=members&session=${selectedSession}`),
        fetch(`/api/schedule?type=slots&session=${selectedSession}`),
      ]);

      const membersData = await membersRes.json();
      const slotsData = await slotsRes.json();

      setMembers(membersData);
      setSlots(slotsData);
    } catch (err) {
      console.error("Failed to fetch schedule data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchScheduleData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession]);

  const getSlotKey = (day: string, start: string) => `${day}-${start}`;

  const getSlotForPosition = (day: keyof WeeklySchedule, start: string): ScheduleSlot | undefined => {
    return slots.find(s => s.day === day && s.start === start);
  };

  const getMemberName = (memberId: string): string => {
    const member = members.find(m => m.id === memberId);
    return member?.name || "Unknown";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine the actual session value
    const actualSession = uploadSession === "__new__" ? newSessionInput : uploadSession;

    if (!uploadFile || !uploadName || !actualSession || actualSession.trim() === "") return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("name", uploadName);
      formData.append("session", actualSession);
      formData.append("file", uploadFile);

      const res = await fetch("/api/schedule/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse timetable");
      }

      setUploadSuccess(true);
      // Reset form
      setUploadName("");
      setUploadFile(null);
      setUploadSession("");
      setNewSessionInput("");
      // Refresh sessions and data
      await fetchSessions();
      if (actualSession === selectedSession) {
        await fetchScheduleData();
      } else {
        setSelectedSession(actualSession);
      }

      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
      }, 2000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRandomize = async () => {
    if (!selectedSession) return;

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "randomize",
          session: selectedSession,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to randomize");
      }

      await fetchScheduleData();
    } catch (err) {
      console.error("Failed to randomize:", err);
      alert(err instanceof Error ? err.message : "Failed to randomize schedule");
    }
  };

  const handleClearSlots = async () => {
    if (!selectedSession) return;
    if (!confirm("Are you sure you want to clear all slot assignments for this session?")) return;

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear",
          session: selectedSession,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to clear slots");
      }

      await fetchScheduleData();
    } catch (err) {
      console.error("Failed to clear slots:", err);
      alert(err instanceof Error ? err.message : "Failed to clear slots");
    }
  };

  const toggleDropdown = async (slotKey: string, day: keyof WeeklySchedule, start: string, end: string) => {
    const newState = !dropdownStates[slotKey];
    // Close all other dropdowns, only open the current one
    setDropdownStates({ [slotKey]: newState });

    if (newState && !availableMembers[slotKey]) {
      // Fetch available members for this slot
      try {
        const res = await fetch(
          `/api/schedule/available?session=${selectedSession}&day=${day}&start=${start}&end=${end}`
        );
        const data = await res.json();
        setAvailableMembers({ ...availableMembers, [slotKey]: data });
      } catch (err) {
        console.error("Failed to fetch available members:", err);
      }
    }
  };

  const handleAssignMember = async (slot: ScheduleSlot | undefined, memberId: string, day: keyof WeeklySchedule, start: string, end: string) => {
    try {
      if (slot) {
        // Update existing slot
        const newMembers = slot.assignedMembers.includes(memberId)
          ? slot.assignedMembers.filter(id => id !== memberId)
          : [...slot.assignedMembers, memberId];

        const res = await fetch(`/api/schedule/slots/${slot.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignedMembers: newMembers }),
        });

        if (!res.ok) throw new Error("Failed to update slot");
      } else {
        // Create new slot with member
        const res = await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            day,
            start,
            end,
            session: selectedSession,
            assignedMembers: [memberId],
          }),
        });

        if (!res.ok) throw new Error("Failed to create slot");
      }

      await fetchScheduleData();
    } catch (err) {
      console.error("Failed to assign member:", err);
    }
  };

  const handlePreviewExport = async () => {
    setIsExporting(true);
    try {
      // Create canvas and draw schedule table manually
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Configuration
      const scale = 2; // For higher resolution
      const padding = 40;
      const headerHeight = 80;
      const rowHeight = 80;
      const timeColWidth = 140;
      const dayColWidth = 160;
      const cellPadding = 12;

      // Calculate dimensions
      const tableWidth = timeColWidth + (DAYS.length * dayColWidth);
      const tableHeight = headerHeight + (TIME_SLOTS.length * rowHeight);
      const totalWidth = tableWidth + (padding * 2);
      const totalHeight = tableHeight + (padding * 2) + 60; // Extra space for title

      canvas.width = totalWidth * scale;
      canvas.height = totalHeight * scale;
      ctx.scale(scale, scale);

      // Colors
      const colors = {
        background: '#ffffff',
        headerBg: '#f8fafc',
        headerText: '#64748b',
        cellBorder: '#e2e8f0',
        titleText: '#0f172a',
        subtitleText: '#64748b',
        timeText: '#0f172a',
        memberBg: '#e0e7ff',
        memberText: '#4338ca',
      };

      // Fill background
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw title
      ctx.fillStyle = colors.titleText;
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Schedule - ${selectedSession}`, padding, padding + 20);

      ctx.fillStyle = colors.subtitleText;
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, padding, padding + 40);

      const tableStartY = padding + 60;

      // Draw header background
      ctx.fillStyle = colors.headerBg;
      ctx.fillRect(padding, tableStartY, tableWidth, headerHeight);

      // Draw header border
      ctx.strokeStyle = colors.cellBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, tableStartY, tableWidth, headerHeight);

      // Draw header text
      ctx.fillStyle = colors.headerText;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      // Time header
      ctx.fillText('TIME', padding + cellPadding, tableStartY + headerHeight / 2);

      // Day headers
      DAYS.forEach((day, index) => {
        const x = padding + timeColWidth + (index * dayColWidth);
        ctx.strokeRect(x, tableStartY, dayColWidth, headerHeight);
        ctx.fillText(day.toUpperCase(), x + cellPadding, tableStartY + headerHeight / 2);
      });

      // Draw rows
      TIME_SLOTS.forEach((timeSlot, rowIndex) => {
        const y = tableStartY + headerHeight + (rowIndex * rowHeight);

        // Time cell
        ctx.fillStyle = colors.background;
        ctx.fillRect(padding, y, timeColWidth, rowHeight);
        ctx.strokeStyle = colors.cellBorder;
        ctx.strokeRect(padding, y, timeColWidth, rowHeight);

        ctx.fillStyle = colors.timeText;
        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`${timeSlot.start} - ${timeSlot.end}`, padding + cellPadding, y + rowHeight / 2);

        // Day cells
        DAYS.forEach((day, colIndex) => {
          const x = padding + timeColWidth + (colIndex * dayColWidth);
          const slot = getSlotForPosition(day, timeSlot.start);

          // Cell background
          ctx.fillStyle = colors.background;
          ctx.fillRect(x, y, dayColWidth, rowHeight);
          ctx.strokeStyle = colors.cellBorder;
          ctx.strokeRect(x, y, dayColWidth, rowHeight);

          // Draw assigned members as tags
          if (slot?.assignedMembers && slot.assignedMembers.length > 0) {
            const memberNames = slot.assignedMembers.map(id => getMemberName(id));
            let tagY = y + 12;

            memberNames.forEach((name) => {
              if (tagY + 24 > y + rowHeight - 8) return; // Don't overflow cell

              ctx.font = '11px system-ui, -apple-system, sans-serif';
              const textWidth = ctx.measureText(name).width;
              const tagWidth = Math.min(textWidth + 16, dayColWidth - 24);
              const tagX = x + 8;

              // Tag background (rounded rectangle)
              ctx.fillStyle = colors.memberBg;
              ctx.beginPath();
              const radius = 10;
              ctx.moveTo(tagX + radius, tagY);
              ctx.lineTo(tagX + tagWidth - radius, tagY);
              ctx.quadraticCurveTo(tagX + tagWidth, tagY, tagX + tagWidth, tagY + radius);
              ctx.lineTo(tagX + tagWidth, tagY + 20 - radius);
              ctx.quadraticCurveTo(tagX + tagWidth, tagY + 20, tagX + tagWidth - radius, tagY + 20);
              ctx.lineTo(tagX + radius, tagY + 20);
              ctx.quadraticCurveTo(tagX, tagY + 20, tagX, tagY + 20 - radius);
              ctx.lineTo(tagX, tagY + radius);
              ctx.quadraticCurveTo(tagX, tagY, tagX + radius, tagY);
              ctx.closePath();
              ctx.fill();

              // Tag text
              ctx.fillStyle = colors.memberText;
              ctx.font = '11px system-ui, -apple-system, sans-serif';
              ctx.textBaseline = 'middle';
              const displayName = textWidth > tagWidth - 16 
                ? name.substring(0, Math.floor((tagWidth - 24) / 6)) + '...'
                : name;
              ctx.fillText(displayName, tagX + 8, tagY + 10);

              tagY += 26;
            });
          }
        });
      });

      // Draw outer border
      ctx.strokeStyle = colors.cellBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, tableStartY, tableWidth, tableHeight);

      const imageData = canvas.toDataURL('image/png');
      setPreviewImageData({
        data: imageData,
        filename: `schedule-${selectedSession}-${new Date().toISOString().split('T')[0]}.png`,
      });
      setShowExportPreview(true);
    } catch (err) {
      console.error('Failed to generate preview:', err);
      alert('Failed to generate preview');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPreview = () => {
    if (!previewImageData) return;
    const link = document.createElement('a');
    link.href = previewImageData.data;
    link.download = previewImageData.filename;
    link.click();
    setShowExportPreview(false);
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Schedule Allocator
          </h1>
          <p className="mt-1 text-slate-600">
            Upload timetables and allocate personnel to daily slots
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Timetable
            </button>

            {selectedSession && (
              <>
                <button
                  onClick={handleRandomize}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Randomize
                </button>
                <button
                  onClick={handleClearSlots}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </>
            )}
          </div>
        </div>

      {/* Session Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <label htmlFor="session" className="text-sm font-medium text-slate-700">
            Session:
          </label>
          <select
            id="session"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none min-w-[140px]"
          >
            {sessions.length === 0 && (
              <option value="">No sessions yet</option>
            )}
            {sessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
          {selectedSession && (
            <span className="text-sm text-slate-500">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : !selectedSession ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-900">No session selected</h3>
          <p className="mt-2 text-slate-500">Upload a timetable to create a new session.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="mb-4 p-4">
              <h2 className="text-lg font-semibold text-slate-900">Schedule - {selectedSession}</h2>
              <p className="text-sm text-slate-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot.start}>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
                      {timeSlot.start} - {timeSlot.end}
                    </td>
                    {DAYS.map((day) => {
                      const slotKey = getSlotKey(day, timeSlot.start);
                      const slot = getSlotForPosition(day, timeSlot.start);
                      const isOpen = dropdownStates[slotKey];
                      const available = availableMembers[slotKey] || [];

                      return (
                        <td key={day} className="px-4 py-4">
                          <div className="relative">
                            {/* Assigned members */}
                            <div className="mb-2 flex flex-wrap gap-1">
                              {slot?.assignedMembers.map((memberId) => (
                                <span
                                  key={memberId}
                                  className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                                >
                                  {getMemberName(memberId)}
                                  <button
                                    onClick={() => handleAssignMember(slot, memberId, day, timeSlot.start, timeSlot.end)}
                                    className="ml-0.5 text-indigo-500 hover:text-indigo-700"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>

                            {/* Add member dropdown */}
                            <button
                              onClick={() => toggleDropdown(slotKey, day, timeSlot.start, timeSlot.end)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add
                            </button>

                            {isOpen && (
                              <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                                <div className="max-h-48 overflow-y-auto py-1">
                                  {available.filter(m => !slot?.assignedMembers.includes(m.id)).length === 0 ? (
                                    <p className="px-3 py-2 text-xs text-slate-500">No available members</p>
                                  ) : (
                                    available
                                      .filter(m => !slot?.assignedMembers.includes(m.id))
                                      .map((member) => (
                                        <button
                                          key={member.id}
                                          onClick={() => {
                                            handleAssignMember(slot, member.id, day, timeSlot.start, timeSlot.end);
                                            setDropdownStates({ [slotKey]: false });
                                          }}
                                          className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                        >
                                          {member.name}
                                        </button>
                                      ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* Members List */}
      {selectedSession && members.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Members ({members.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div key={member.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">{member.name}</h3>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete ${member.name}'s schedule?`)) {
                          try {
                            await fetch(`/api/schedule/${member.id}`, { method: "DELETE" });
                            fetchScheduleData();
                          } catch (err) {
                            console.error("Failed to delete:", err);
                          }
                        }
                      }}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Added {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Upload Timetable</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError(null);
                  setUploadSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-slate-900">Timetable uploaded!</p>
                <p className="mt-1 text-sm text-slate-500">Schedule has been parsed and saved.</p>
              </div>
            ) : (
              <form onSubmit={handleUpload}>
                {uploadError && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {uploadError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                      Member Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label htmlFor="uploadSession" className="block text-sm font-medium text-slate-700">
                      Session
                    </label>
                    <select
                      id="uploadSession"
                      value={uploadSession === "__new__" ? "__new__" : uploadSession}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setUploadSession("__new__");
                          setNewSessionInput("");
                        } else {
                          setUploadSession(e.target.value);
                          setNewSessionInput("");
                        }
                      }}
                      required={uploadSession !== "__new__"}
                      className="mt-1 block w-full rounded-lg border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    >
                      <option value="" disabled>Select or create new session</option>
                      {sessions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="__new__">+ Create New Session</option>
                    </select>
                    {uploadSession === "__new__" && (
                      <input
                        type="text"
                        value={newSessionInput}
                        onChange={(e) => setNewSessionInput(e.target.value)}
                        placeholder="Enter new session (e.g., 2024/2025)"
                        className="mt-2 block w-full rounded-lg border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        required
                        autoFocus
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="file" className="block text-sm font-medium text-slate-700">
                      Timetable Image
                    </label>
                    <div className="mt-1">
                      <input
                        type="file"
                        id="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        required
                        className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Max 4MB. Supported: PNG, JPG, PDF</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      "Upload & Parse"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Export Schedule</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                <strong>Session:</strong> {selectedSession}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                <strong>Personnel:</strong> {members.length}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                <strong>Allocated Slots:</strong> {slots.filter(s => s.assignedMembers.length > 0).length} / {slots.length}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  handlePreviewExport();
                }}
                disabled={isExporting}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  {isExporting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                  ) : (
                    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{isExporting ? 'Generating...' : 'Export as Image'}</p>
                  <p className="text-xs text-slate-500">Preview before download</p>
                </div>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Preview Modal */}
      {showExportPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-screen overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Export Preview</h2>
              <button
                onClick={() => setShowExportPreview(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 flex justify-center bg-slate-100 rounded-lg p-4 max-h-96 overflow-y-auto">
              {previewImageData && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImageData?.data}
                  alt="Schedule Preview"
                  className="max-w-full rounded-lg"
                />
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExportPreview(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadPreview}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
