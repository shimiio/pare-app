import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileVersionWarning from "#components/ui/MobileVersionWarning";

export default function AppLayout() {
  return (
    <>
      <div className="md:flex h-screen w-screen text-white overflow-hidden hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
          <Header />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileVersionWarning />
    </>
  );
}
