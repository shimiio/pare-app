import MobileVersionWarning from "#components/ui/MobileVersionWarning";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <>
      <div className="md:flex flex-col h-screen w-screen text-white overflow-hidden hidden">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <MobileVersionWarning />
    </>
  );
}
