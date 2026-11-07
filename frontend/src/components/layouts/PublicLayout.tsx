import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="flex flex-col h-dvh w-screen text-white overflow-x-hidden overflow-y-auto pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
