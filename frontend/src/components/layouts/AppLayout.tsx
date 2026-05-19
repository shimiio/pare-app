import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto 2xl:p-15 2xl:px-75">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
