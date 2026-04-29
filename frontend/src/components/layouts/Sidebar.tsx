import { NavLink } from "react-router-dom";
import { LayoutGrid, List, ChartLine, Bolt } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { label: "Subscriptions", path: "/subscriptions", icon: List },
  { label: "Analytics", path: "/analytics", icon: ChartLine },
  { label: "Settings", path: "/settings", icon: Bolt },
];

export default function Sidebar() {
  return (
    <nav className="flex flex-col justify-between border-r border-white/50 2xl:p-6 2xl:py-12">
      <div className="flex flex-col 2xl:space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-row rounded-xl 2xl:text-2xl 2xl:p-5 2xl:px-6 2xl:gap-4 hover:bg-white/20 transition duration-200 ease-in-out ${isActive ? "bg-white/20 text-white" : "text-white/80"}`
            }
          >
            <item.icon className="2xl:h-8 2xl:w-8" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="flex text-white/80 2xl:text-2xl">Budget</div>
    </nav>
  );
}
