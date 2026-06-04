import { NavLink } from "react-router-dom";
import { LayoutGrid, List, ChartLine, Bolt, Sparkles } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { label: "Subscriptions", path: "/subscriptions", icon: List },
  { label: "Analytics", path: "/analytics", icon: ChartLine },
  { label: "Settings", path: "/settings", icon: Bolt },
];

export default function Sidebar() {
  return (
    <nav className="flex flex-col border-r border-white/5 bg-black/5 backdrop-blur-md 2xl:p-2 2xl:py-12">
      <div className="flex flex-row items-center mb-10 gap-2 mx-auto">
        <Sparkles />
        <span className="flex 2xl:text-3xl font-mono items-center">
          Pare
        </span>
      </div>

      <div className="flex flex-col 2xl:space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-row items-center rounded-lg 2xl:text-2xl 2xl:p-3 2xl:px-6 2xl:gap-2 hover:bg-white/10 active:bg-white/7 transition duration-200 ease-in-out ${isActive ? "bg-white/10 text-white" : "text-white/80"}`
            }
          >
            <item.icon className="2xl:h-6 2xl:w-6" />
            <span className="">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
