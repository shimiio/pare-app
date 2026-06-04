import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <Header />
        <main className="flex-1 p-6 2xl:p-10 2xl:px-75">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
