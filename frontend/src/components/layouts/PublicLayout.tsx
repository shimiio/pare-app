import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function PublicLayout() {
  return (
    <div className="flex flex-col h-screen w-screen text-white overflow-hidden">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
