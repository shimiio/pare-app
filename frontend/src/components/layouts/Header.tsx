import { useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/subscriptions": "Subscriptions",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function Header() {
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname];

  return (
    <header className="flex flex-row justify-between transform-gpu border-b border-white/5 bg-[#121212]/10 p-6 2xl:p-7 px-24 2xl:px-40 backdrop-blur-md sticky top-0 z-10">
      <div className="flex font-semibold text-neutral-200 uppercase tracking-wider items-center">
        {currentTitle}
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212]/5 border border-white/10 rounded-lg transition-colors">
        <Calendar size={14} className="text-neutral-400" strokeWidth={1.5} />
        <p className="text-xs 2xl:text-sm font-medium text-neutral-200">
          <span className="text-neutral-400 mr-1">Today is</span>
          {today}
        </p>
      </div>
    </header>
  );
}
