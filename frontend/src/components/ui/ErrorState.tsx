import { CircleAlert, RotateCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We could not load your data. Check your connection and try again.",
  onRetry,
  isRetrying,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-100 text-center max-w-sm mx-auto select-none"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center text-red-300 mb-4 shadow-sm">
        <CircleAlert size={20} strokeWidth={2} aria-hidden="true" />
      </div>

      <h3 className="text-sm font-medium text-neutral-200 uppercase tracking-wider">
        {title}
      </h3>

      <p className="text-xs text-neutral-500 mt-2 mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-1 px-3 py-1.5 backdrop-blur-xs text-white bg-linear-to-br from-pink-400/15 via-violet-500/10 to-blue-500/20 border border-white/5 hover:bg-violet-400/5 shadow-md shadow-indigo-600/10 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCw
            size={12}
            strokeWidth={2}
            className={isRetrying ? "animate-spin" : undefined}
            aria-hidden="true"
          />
          <span className="text-neutral-200">
            {isRetrying ? "Retrying..." : "Try again"}
          </span>
        </button>
      )}
    </div>
  );
}
