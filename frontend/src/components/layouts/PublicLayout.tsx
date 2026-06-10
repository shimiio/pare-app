import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="flex flex-col h-screen w-screen text-white overflow-hidden">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
