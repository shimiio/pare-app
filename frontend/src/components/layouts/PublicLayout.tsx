import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function PublicLayout() {
  return (
    <div className="flex flex-col h-screen text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
