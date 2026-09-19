import { LoaderCircle } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading" }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center min-h-100 text-center select-none"
    >
      <LoaderCircle
        size={20}
        strokeWidth={2}
        className="text-indigo-400 animate-spin"
        aria-hidden="true"
      />

      <p className="text-xs text-neutral-500 mt-4 tracking-wider uppercase">
        {message}
      </p>
    </div>
  );
}
