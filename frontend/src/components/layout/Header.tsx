import { useState } from "react";
import { Diamond } from "lucide-react";
import LoginModal from "./AuthModals/LoginModal";
import SignupModal from "./AuthModals/SignupModal";

export default function Header() {
  const [modal, setModal] = useState<"login" | "signup" | null>(null);

  return (
    <header className="flex flex-row justify-between 2xl:p-8 2xl:px-30 border-b border-white/50">
      <div className="flex items-center 2xl:gap-2">
        <Diamond size={32} />
        <span className="flex 2xl:text-2xl">Pare.</span>
      </div>
      <div className="flex 2xl:gap-7">
        <button
          className="cursor-pointer 2xl:text-xl duration-200 transition ease-in-out hover:text-white/75"
          onClick={() => setModal("login")}
        >
          Log In
        </button>
        <button
          className="cursor-pointer text-black bg-white rounded-xl font-medium 2xl:p-3 2xl:px-4 2xl:text-xl transition duration-200 ease-in-out hover:bg-white/80"
          onClick={() => setModal("signup")}
        >
          Sign Up
        </button>

        {modal == "login" && <LoginModal onClose={() => setModal(null)} />}
        {modal == "signup" && <SignupModal onClose={() => setModal(null)} />}
      </div>
    </header>
  );
}
