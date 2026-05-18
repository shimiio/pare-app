import { useState } from "react";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";
import { useAuthStore } from "../../store/useAuthStore";

export default function Header() {
  const [modal, setModal] = useState<"login" | "signup" | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <header className="flex flex-row justify-between 2xl:p-8 2xl:px-35 border-b border-dashed border-white/50">
      <span className="flex 2xl:text-2xl font-mono items-center">Pare</span>
      {isAuthenticated ? (
        <span className="2xl:text-2xl font-medium">name</span>
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

          {modal == "login" && <LoginModal onClose={() => setModal(null)} />}
          {modal == "signup" && <SignupModal onClose={() => setModal(null)} />}
        </div>
      )}
    </header>
  );
}
