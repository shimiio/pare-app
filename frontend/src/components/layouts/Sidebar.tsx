import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  ChartNoAxesColumn,
  Settings,
  CircleUserRound,
} from "lucide-react";
import Logo from "#components/ui/Logo";
import { useUser } from "#hooks/useUser";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Subscriptions", path: "/subscriptions", icon: CreditCard },
  { label: "Analytics", path: "/analytics", icon: ChartNoAxesColumn },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const { data } = useUser();

  return (
    <nav className="flex flex-col border-r border-white/5 bg-[#121212]/10 backdrop-blur-md p-2 py-10 2xl:py-12">
      <div className="flex flex-row items-center mb-15 2xl:mb-17 gap-2 mx-auto">
        <Logo />
        <span className="flex text-xl items-center font-medium">Pare</span>
      </div>

      <div className="flex flex-col h-full justify-between">
        <div className="flex flex-col space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-row items-center 2xl:text-lg p-1.5 px-4 2xl:px-6 rounded-lg 2xl:rounded-xl gap-2 hover:text-white hover:bg-white/5 active:text-white/80 transition duration-200 ease-in-out ${isActive ? "text-white bg-white/5" : "text-white/60"}`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex flex-row items-center gap-2 p-3 border-t border-white/5">
          <CircleUserRound className="opacity-60 h-5 w-5 2xl:h-6 2xl:w-6" />
          <div>
            <p className="flex flex-row gap-1 text-sm 2xl:text-base">{data?.name}</p>
            <p className="text-white/40 text-[11px] 2xl:text-xs">{data?.email}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
