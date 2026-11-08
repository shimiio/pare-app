import { NavLink } from "react-router-dom";
import { navItems } from "./navItems";

// Floats over the scrolling content (fixed), so the blur has something to blur, like the
// desktop header. Its height is 3.5rem + the bottom safe area; AppLayout pads the content by
// exactly that (BOTTOM_NAV_SPACE), so keep the two in sync when changing sizes here.
export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex md:hidden gap-1 border-t border-white/5 bg-[#121212]/60 backdrop-blur-md transform-gpu p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pl-[max(0.25rem,env(safe-area-inset-left))] pr-[max(0.25rem,env(safe-area-inset-right))]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-1 min-w-0 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] leading-4 active:text-white/80 transition duration-200 ease-in-out ${isActive ? "text-white bg-white/5" : "text-white/60"}`
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
