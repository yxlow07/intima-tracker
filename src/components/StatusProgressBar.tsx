"use client";

type StatusProgressBarProps = {
  status: string;
};

const STEPS = [
  { label: "Pending", description: "Submission Received" },
  { label: "Under Review", description: "INTIMA Team reviewing" },
  { label: "Amendments", description: "Action required", statusMatch: "Amendments Required" },
  { label: "Final Verdict", description: "Decision made" },
];

// Map status to step number
function getStepFromStatus(status: string): number {
  switch (status) {
    case "Pending":
      return 1;
    case "Under Review":
      return 2;
    case "KIV":
      return 2; // KIV is similar to Under Review
    case "Amendments Required":
      return 3;
    case "Approved":
    case "Rejected":
      return 4;
    default:
      return 1;
  }
}

// Check if this is a final verdict status
function isFinalVerdict(status: string): boolean {
  return status === "Approved" || status === "Rejected";
}

// Get the final verdict display
function getFinalVerdictDisplay(status: string): { label: string; color: string } {
  if (status === "Approved") {
    return { label: "Approved", color: "emerald" };
  } else if (status === "Rejected") {
    return { label: "Rejected", color: "rose" };
  }
  return { label: "Final Verdict", color: "indigo" };
}

export default function StatusProgressBar({ status }: StatusProgressBarProps) {
  const currentStep = getStepFromStatus(status);
  const totalSteps = STEPS.length;
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const finalVerdict = getFinalVerdictDisplay(status);

  return (
    <div className="w-full">
      {/* Mobile: Vertical Layout */}
      <div className="block sm:hidden">
        <div className="relative flex flex-col">
          {/* Vertical Connecting Line */}
          <div
            className="absolute left-5 top-5 h-[calc(100%-40px)] w-0.5"
            style={{ transform: "translateX(-50%)" }}
          >
            {/* Gray Background Line */}
            <div className="absolute left-0 top-0 h-full w-full rounded bg-slate-200"></div>
            {/* Colored Active Line */}
            <div
              className={`absolute left-0 top-0 w-full rounded transition-all duration-500 ease-in-out ${
                isFinalVerdict(status) && status === "Rejected"
                  ? "bg-rose-600"
                  : isFinalVerdict(status) && status === "Approved"
                  ? "bg-emerald-600"
                  : "bg-indigo-600"
              }`}
              style={{ height: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Steps */}
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            const isFinal = stepNum === 4;

            let activeColor = "indigo";
            if (isFinal && isFinalVerdict(status)) {
              activeColor = finalVerdict.color;
            }

            return (
              <div
                key={step.label}
                className="relative z-10 flex items-center gap-4 py-4"
              >
                {/* Circle */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-indigo-600 text-white shadow-md"
                      : isActive
                      ? `text-white shadow-md ring-4 scale-110 ${
                          activeColor === "emerald"
                            ? "bg-emerald-600 ring-emerald-100"
                            : activeColor === "rose"
                            ? "bg-rose-600 ring-rose-100"
                            : "bg-indigo-600 ring-indigo-100"
                        }`
                      : "bg-slate-200 text-slate-500 shadow-sm"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isFinal && isFinalVerdict(status) && isActive ? (
                    status === "Approved" ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )
                  ) : (
                    stepNum
                  )}
                </div>

                {/* Label */}
                <div>
                  <p
                    className={`text-sm uppercase tracking-wide transition-colors duration-300 ${
                      isCompleted
                        ? "font-bold text-indigo-600"
                        : isActive
                        ? `font-bold ${
                            isFinal && status === "Approved"
                              ? "text-emerald-700"
                              : isFinal && status === "Rejected"
                              ? "text-rose-700"
                              : "text-indigo-700"
                          }`
                        : "font-semibold text-slate-400"
                    }`}
                  >
                    {isFinal && isFinalVerdict(status) && isActive ? finalVerdict.label : step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {isFinal && isFinalVerdict(status) && isActive ? "Decision made" : step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Horizontal Layout */}
      <div className="hidden sm:block">
        <div className="relative w-full">
          {/* Connecting Line Container */}
          <div className="absolute left-[12.5%] w-[75%]" style={{ top: "20px" }}>
            {/* Gray Background Line */}
            <div className="absolute left-0 top-0 h-1 w-full rounded bg-slate-200"></div>
            {/* Colored Active Line */}
            <div
              className={`absolute left-0 top-0 h-1 rounded transition-all duration-500 ease-in-out ${
                isFinalVerdict(status) && status === "Rejected"
                  ? "bg-rose-600"
                  : isFinalVerdict(status) && status === "Approved"
                  ? "bg-emerald-600"
                  : "bg-indigo-600"
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Steps Container */}
          <div className="relative z-10 flex w-full items-start justify-between">
            {STEPS.map((step, index) => {
              const stepNum = index + 1;
              const isCompleted = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              const isFinal = stepNum === 4;

              let activeColor = "indigo";
              if (isFinal && isFinalVerdict(status)) {
                activeColor = finalVerdict.color;
              }

              return (
                <div key={step.label} className="flex w-1/4 flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-indigo-600 text-white shadow-md"
                        : isActive
                        ? `text-white shadow-md ring-4 scale-110 ${
                            activeColor === "emerald"
                              ? "bg-emerald-600 ring-emerald-100"
                              : activeColor === "rose"
                              ? "bg-rose-600 ring-rose-100"
                              : "bg-indigo-600 ring-indigo-100"
                          }`
                        : "bg-slate-200 text-slate-500 shadow-sm"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isFinal && isFinalVerdict(status) && isActive ? (
                      status === "Approved" ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )
                    ) : (
                      stepNum
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-4 text-center">
                    <p
                      className={`text-sm uppercase tracking-wide transition-colors duration-300 ${
                        isCompleted
                          ? "font-bold text-indigo-600"
                          : isActive
                          ? `font-bold ${
                              isFinal && status === "Approved"
                                ? "text-emerald-700"
                                : isFinal && status === "Rejected"
                                ? "text-rose-700"
                                : "text-indigo-700"
                            }`
                          : "font-semibold text-slate-400"
                      }`}
                    >
                      {isFinal && isFinalVerdict(status) && isActive ? finalVerdict.label : step.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {isFinal && isFinalVerdict(status) && isActive ? "Decision made" : step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
