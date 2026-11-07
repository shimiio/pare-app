import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex flex-col md:flex-row h-dvh w-screen text-white overflow-hidden pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <Sidebar />
      <div className="flex-1 min-h-0 flex flex-col h-full overflow-y-auto relative">
        <Header />
        <main className="flex-1 md:p-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
