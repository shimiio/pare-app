import { NavLink } from "react-router-dom";
import { navItems } from "./navItems";

export default function BottomNav() {
  return (
    <nav className="flex md:hidden shrink-0 gap-1 border-t border-white/5 bg-[#121212]/10 p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-1 min-w-0 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] active:text-white/80 transition duration-200 ease-in-out ${isActive ? "text-white bg-white/5" : "text-white/60"}`
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
