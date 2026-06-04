import { useState } from "react";
import { useLocation } from "react-router-dom";
import { User } from "lucide-react";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";
import { useAuthStore } from "../../store/useAuthStore";
import { useUser } from "../../hooks/useUser";

const routeTitles: Record<string, string> = {
  "/": "Pare",
  "/dashboard": "Dashboard",
  "/subscriptions": "Subscriptions",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function Header() {
  const [modal, setModal] = useState<"login" | "signup" | null>(null);
  const { data } = useUser();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const currentTitle = routeTitles[location.pathname] || "Pare";

  return (
    <>
      <header className="flex flex-row justify-between transform-gpu border-b border-white/5 bg-black/5 2xl:p-8 2xl:px-40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex text-3xl items-center font-medium">
          {currentTitle}
        </div>
        {isAuthenticated ? (
          <div className="flex flex-row font-medium items-center gap-3 2xl:text-2xl">
            {data?.name}
            <User />
          </div>
        ) : (
          <div className="flex 2xl:gap-6">
            <button
              className="cursor-pointer 2xl:text-xl duration-200 transition ease-in-out hover:text-white/75"
              onClick={() => setModal("login")}
            >
              Log In
            </button>

            <button
              className="cursor-pointer text-black bg-white rounded-2xl font-medium 2xl:p-2.5 2xl:px-4 2xl:text-xl transition duration-200 ease-in-out hover:bg-white/80"
              onClick={() => setModal("signup")}
            >
              Sign Up
            </button>
          </div>
        )}
      </header>
      <div>
        {modal == "login" && <LoginModal onClose={() => setModal(null)} />}
        {modal == "signup" && <SignupModal onClose={() => setModal(null)} />}
      </div>
    </>
  );
}
