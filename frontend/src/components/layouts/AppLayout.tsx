import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Header from "./Header";
import Sidebar from "./Sidebar";

// Room under the content for the floating bottom nav on phones: its 3.5rem plus its bottom
// padding (see BottomNav). Without it the last items would stay hidden behind the nav.
const BOTTOM_NAV_SPACE =
  "pb-[calc(3.5rem+max(0.25rem,env(safe-area-inset-bottom)))] md:pb-0";

export default function AppLayout() {
  return (
    <div className="flex flex-col md:flex-row h-dvh w-screen text-white overflow-hidden pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <Sidebar />
      <div
        className={`flex-1 min-h-0 flex flex-col h-full overflow-y-auto relative pt-[env(safe-area-inset-top)] md:pt-0 ${BOTTOM_NAV_SPACE}`}
      >
        <Header />
        <main className="flex-1 md:p-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
