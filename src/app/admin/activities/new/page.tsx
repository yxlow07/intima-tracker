"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

type Activity = {
  id: string;
  activityName: string;
  description?: string;
  activityDate?: string;
  activityType?: string;
  affiliate?: string;
  status: string;
  formType: "SAP" | "ASF";
};

type FormType = "SAP" | "ASF" | null;

type ParsedSapData = {
  activityName?: string | null;
  description?: string | null;
  activityDate?: string | null;
  activityTime?: string | null;
  activityType?: string | null;
  affiliate?: string | null;
};

// Helper to convert date and time to datetime-local format
function combineDateAndTime(date: string | null, time: string | null): string {
  if (!date) return "";
  
  // Start with the date
  let dateTimeStr = date;
  
  if (time) {
    // Try to parse time string like "9:00 AM", "14:30", etc.
    const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const period = timeMatch[3]?.toUpperCase();
      
      // Convert to 24-hour format if AM/PM specified
      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }
      
      dateTimeStr += `T${hours.toString().padStart(2, "0")}:${minutes}`;
    } else {
      // Default to midnight if time can't be parsed
      dateTimeStr += "T00:00";
    }
  } else {
    // Default to midnight if no time provided
    dateTimeStr += "T00:00";
  }
  
  return dateTimeStr;
}

export default function CreateActivityPage() {
  const router = useRouter();
  const [selectedFormType, setSelectedFormType] = useState<FormType>(null);
  const [sapActivities, setSapActivities] = useState<Activity[]>([]);
  const [selectedSapId, setSelectedSapId] = useState<string>("");
  const [selectedSap, setSelectedSap] = useState<Activity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PDF upload states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedSapData | null>(null);

  // Form field states for SAP (to allow auto-fill and editing)
  const [activityName, setActivityName] = useState("");
  const [description, setDescription] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityType, setActivityType] = useState("");
  const [affiliate, setAffiliate] = useState("");

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setParseError("Only PDF files are allowed.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setParseError("File too large. Maximum size is 15MB.");
        return;
      }
      setPdfFile(file);
      setParseError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  const handleParsePdf = async () => {
    if (!pdfFile) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch("/api/parse-sap", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse PDF");
      }

      const data: ParsedSapData = await response.json();
      setParsedData(data);

      // Auto-fill form fields
      if (data.activityName) setActivityName(data.activityName);
      if (data.description) setDescription(data.description);
      if (data.activityDate) {
        setActivityDate(combineDateAndTime(data.activityDate, data.activityTime || null));
      }
      if (data.activityType) setActivityType(data.activityType);
      if (data.affiliate) setAffiliate(data.affiliate);
    } catch (error) {
      console.error("Error parsing PDF:", error);
      setParseError(error instanceof Error ? error.message : "Failed to parse PDF. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const clearPdfUpload = () => {
    setPdfFile(null);
    setParsedData(null);
    setParseError(null);
  };

  useEffect(() => {
    // Fetch all SAP activities for the ASF linking dropdown
    fetch("/api/activities?formType=SAP")
      .then((res) => res.json())
      .then((data) => setSapActivities(data))
      .catch((err) => console.error("Failed to fetch SAP activities:", err));
  }, []);

  const filteredSaps = sapActivities.filter((sap) =>
    sap.activityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSapSelect = (sapId: string) => {
    setSelectedSapId(sapId);
    const sap = sapActivities.find((s) => s.id === sapId);
    setSelectedSap(sap || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityName: selectedFormType === "SAP" ? activityName : new FormData(e.currentTarget).get("activityName"),
          description: selectedFormType === "SAP" ? description : new FormData(e.currentTarget).get("description"),
          activityDate: selectedFormType === "SAP" ? activityDate : new FormData(e.currentTarget).get("activityDate"),
          activityType: selectedFormType === "SAP" ? activityType : new FormData(e.currentTarget).get("activityType"),
          affiliate: selectedFormType === "SAP" ? affiliate : new FormData(e.currentTarget).get("affiliate"),
          status: new FormData(e.currentTarget).get("status"),
          formType: selectedFormType,
          sapActivityId: selectedFormType === "ASF" ? selectedSapId : null,
        }),
      });

      if (response.ok) {
        router.push("/admin/activities");
        router.refresh();
      } else {
        console.error("Failed to create activity");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      setIsSubmitting(false);
    }
  };

  // Step 1: Form Type Selection
  if (!selectedFormType) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Create New Activity
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Select the type of form you want to create.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* SAP Card */}
          <button
            onClick={() => setSelectedFormType("SAP")}
            className="relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 hover:ring-indigo-500 hover:shadow-md transition-all group text-left"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Student Activity Proposal (SAP)
            </h3>
            <p className="mt-2 text-sm text-slate-500 text-center">
              Create a new activity proposal for review and approval before the activity takes place.
            </p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
              Create SAP
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>

          {/* ASF Card */}
          <button
            onClick={() => setSelectedFormType("ASF")}
            className="relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 hover:ring-indigo-500 hover:shadow-md transition-all group text-left"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Activity Summary Form (ASF)
            </h3>
            <p className="mt-2 text-sm text-slate-500 text-center">
              Submit a summary report for a completed activity that was previously approved.
            </p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
              Create ASF
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Form Entry
  return (
    <div className="mx-auto max-w-2xl">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <button
            onClick={() => {
              setSelectedFormType(null);
              setSelectedSapId("");
              setSelectedSap(null);
            }}
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
            Back to form selection
          </button>
          <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Create {selectedFormType === "SAP" ? "Student Activity Proposal" : "Activity Summary Form"}
          </h2>
          <div className="mt-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                selectedFormType === "SAP"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {selectedFormType}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {/* ASF: SAP Selection */}
          {selectedFormType === "ASF" && (
            <div className="mb-6 pb-6 border-b border-slate-200">
              <label
                htmlFor="sapSearch"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Link to SAP <span className="text-rose-500">*</span>
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Select the Student Activity Proposal this summary is for.
              </p>
              <div className="relative">
                <input
                  type="text"
                  id="sapSearch"
                  placeholder="Search SAP by activity name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm mb-2"
                />
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                  {filteredSaps.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      {sapActivities.length === 0
                        ? "No SAP activities found. Create a SAP first."
                        : "No matching SAP found."}
                    </div>
                  ) : (
                    filteredSaps.map((sap) => (
                      <button
                        key={sap.id}
                        type="button"
                        onClick={() => handleSapSelect(sap.id)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${
                          selectedSapId === sap.id
                            ? "bg-indigo-50 border-indigo-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-900">
                              {sap.activityName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {sap.activityDate
                                ? new Date(sap.activityDate).toLocaleDateString()
                                : "No date set"}{" "}
                              • {sap.activityType || "No type"}
                            </div>
                          </div>
                          {selectedSapId === sap.id && (
                            <svg
                              className="h-5 w-5 text-indigo-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              {selectedSap && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <div className="text-sm font-medium text-indigo-900">
                    Selected: {selectedSap.activityName}
                  </div>
                  <div className="text-xs text-indigo-700 mt-1">
                    Activity details will be automatically filled from this SAP.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SAP: PDF Upload Section */}
          {selectedFormType === "SAP" && (
            <div className="mb-6 pb-6 border-b border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Upload SAP Document (Optional)
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Upload a PDF to automatically extract activity details using AI.
              </p>

              {!pdfFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-slate-600">
                    {isDragActive ? (
                      "Drop the PDF here..."
                    ) : (
                      <>
                        <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">PDF up to 15MB</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <svg
                          className="h-5 w-5 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{pdfFile.name}</p>
                        <p className="text-xs text-slate-500">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearPdfUpload}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {!parsedData && (
                    <button
                      type="button"
                      onClick={handleParsePdf}
                      disabled={isParsing}
                      className="mt-4 w-full inline-flex justify-center items-center rounded-lg border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isParsing ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Parsing with AI...
                        </>
                      ) : (
                        <>
                          <svg
                            className="-ml-1 mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          Parse PDF with AI
                        </>
                      )}
                    </button>
                  )}

                  {parsedData && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          Document parsed successfully! Review and edit the form below.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {parseError && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-red-700">{parseError}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form with loading overlay */}
          <div className="relative">
            {/* Loading overlay */}
            {isParsing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                <svg
                  className="animate-spin h-10 w-10 text-indigo-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm font-medium text-slate-700">Extracting details with AI...</p>
                <p className="text-xs text-slate-500 mt-1">This may take a moment</p>
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="activityName"
                className="block text-sm font-medium text-slate-700"
              >
                Activity Name
              </label>
              <div className="mt-1">
                {selectedFormType === "SAP" ? (
                  <input
                    type="text"
                    name="activityName"
                    id="activityName"
                    required
                    disabled={isParsing}
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                ) : (
                  <input
                    type="text"
                    name="activityName"
                    id="activityName"
                    required
                    readOnly
                    defaultValue={selectedSap?.activityName || ""}
                    className="block w-full rounded-lg border-slate-300 shadow-sm bg-slate-50 cursor-not-allowed sm:text-sm"
                  />
                )}
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
                {selectedFormType === "SAP" ? (
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    disabled={isParsing}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                  ></textarea>
                ) : (
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    readOnly
                    defaultValue={selectedSap?.description || ""}
                    className="block w-full rounded-lg border-slate-300 shadow-sm bg-slate-50 cursor-not-allowed sm:text-sm"
                  ></textarea>
                )}
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
                  {selectedFormType === "SAP" ? (
                    <input
                      type="datetime-local"
                      name="activityDate"
                      id="activityDate"
                      disabled={isParsing}
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                  ) : (
                    <input
                      type="datetime-local"
                      name="activityDate"
                      id="activityDate"
                      readOnly
                      defaultValue={
                        selectedSap?.activityDate
                          ? selectedSap.activityDate.slice(0, 16)
                          : ""
                      }
                      className="block w-full rounded-lg border-slate-300 shadow-sm bg-slate-50 cursor-not-allowed sm:text-sm"
                    />
                  )}
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
                  {selectedFormType === "ASF" ? (
                    <input
                      type="text"
                      name="activityType"
                      id="activityType"
                      readOnly
                      value={selectedSap?.activityType || ""}
                      className="block w-full rounded-lg border-slate-300 shadow-sm bg-slate-50 cursor-not-allowed sm:text-sm"
                    />
                  ) : (
                    <select
                      id="activityType"
                      name="activityType"
                      disabled={isParsing}
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
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
                {selectedFormType === "SAP" ? (
                  <input
                    type="text"
                    name="affiliate"
                    id="affiliate"
                    disabled={isParsing}
                    value={affiliate}
                    onChange={(e) => setAffiliate(e.target.value)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                ) : (
                  <input
                    type="text"
                    name="affiliate"
                    id="affiliate"
                    readOnly
                    defaultValue={selectedSap?.affiliate || ""}
                    className="block w-full rounded-lg border-slate-300 shadow-sm bg-slate-50 cursor-not-allowed sm:text-sm"
                  />
                )}
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
                  disabled={isParsing}
                  defaultValue="Pending"
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
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
                disabled={isSubmitting || isParsing || (selectedFormType === "ASF" && !selectedSapId)}
                className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : `Create ${selectedFormType}`}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}

