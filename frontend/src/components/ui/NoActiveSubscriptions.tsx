import { Plus } from "lucide-react";
import Logo from "./Logo";

interface ButtonProps {
  onClick: () => void;
}

export default function NoActiveSubscriptions({ onClick }: ButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 text-center max-w-sm mx-auto select-none">
      <div className="w-12 h-12 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center text-indigo-400 text-xl mb-4 shadow-sm">
        <Logo />
      </div>

      <h3 className="text-sm font-medium text-neutral-200 uppercase tracking-wider">
        No active subscriptions
      </h3>

      <p className="text-xs text-neutral-500 mt-2 mb-6 leading-relaxed">
        Track your first service to unlock financial summaries, billing cycle
        analysis, and cost breakdowns.
      </p>

      <button
        onClick={onClick}
        className="flex items-center gap-1 px-3 py-1.5 backdrop-blur-xs text-white bg-linear-to-br from-pink-400/15 via-violet-500/10 to-blue-500/20 border border-white/5 hover:bg-violet-400/5 shadow-md shadow-indigo-600/10 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
      >
        <Plus size={12} strokeWidth={2} />
        <span className="text-neutral-200">Add Subscription</span>
      </button>
    </div>
  );
}
