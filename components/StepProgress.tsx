interface Props {
  steps: string[];
  currentStep: number; // 0-indexed
}

export default function StepProgress({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  done
                    ? "bg-brand-green text-white"
                    : active
                    ? "bg-brand-green text-white ring-4 ring-brand-green-light"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium hidden sm:block ${
                  active ? "text-brand-green" : done ? "text-brand-green" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors ${
                  done ? "bg-brand-green" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
