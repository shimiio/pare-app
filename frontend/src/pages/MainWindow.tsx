import { useState } from "react";
import { Bell, Euro, ChartNoAxesColumn, Lock } from "lucide-react";
import Logo from "#components/ui/Logo";
import LoginModal from "#components/auth/LoginModal";
import SignupModal from "#components/auth/SignupModal";

export default function MainWindow() {
  const [modal, setModal] = useState<"login" | "signup" | null>(null);

  return (
    <div className="flex flex-col items-center mx-auto justify-between h-full">
      <div className="flex flex-col items-center mt-27 2xl:mt-37">
        <div className="flex flex-row items-center gap-1 mb-13">
          <span className="rounded-xl flex items-center justify-center text-indigo-400">
            <Logo />
          </span>
          <span className="text-2xl font-medium">Pare</span>
        </div>

        <div className="text-3xl font-bold mb-5.5 text-center">
          <p className="mb-1">You probably pay for</p>
          <p>more than you think.</p>
        </div>

        <p className="mb-11.5 text-neutral-400 text-center text-sm">
          A subscription manager that shows exactly what you're paying for.
        </p>

        <div className="flex gap-3 mb-4 2xl:mb-5">
          <button
            className="px-4 py-2 border backdrop-blur-xs border-white/10 bg-[#121212]/40 hover:bg-white/5 duration-150 rounded-lg shadow-md shadow-white/5 cursor-pointer"
            onClick={() => setModal("login")}
          >
            Log In
          </button>

          <button
            className="px-4 py-2 bg-linear-to-br from-pink-400/15 via-violet-500/10 backdrop-blur-xs to-blue-500/20 border border-white/5 hover:bg-violet-400/5 rounded-lg font-medium duration-150 shadow-md shadow-indigo-600/10 cursor-pointer"
            onClick={() => setModal("signup")}
          >
            Sign Up
          </button>
        </div>

        <div className="flex flex-col text-center text-xs text-neutral-500 mb-12 2xl:mb-15">
          <div className="flex">
            <Lock className="h-4" />
            <p>
              Your data is encrypted and secure. We never sell or share your
              information.
            </p>
          </div>

          <p>
            Open source — verify yourself.{" "}
            <a
              href="https://github.com/shimiio/pare-app"
              target="_blank"
              className="text-white/60 hover:text-white duration-150"
            >
              GitHub ↗
            </a>
          </p>
        </div>

        <div className="flex flex-row gap-4">
          <div className="p-5 bg-[#121212]/40 border border-white/8 rounded-lg w-55 shadow-lg shadow-white/5">
            <Bell className="opacity-65 h-5 w-5" />
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mt-5 mb-2">
              Reminders
            </h3>
            <div className="text-sm">
              <p>Email alerts before</p>
              <p>renewals</p>
            </div>
          </div>

          <div className="p-5 bg-[#121212]/40 border border-white/8 rounded-lg w-55 shadow-lg shadow-white/5">
            <Euro className="opacity-65 h-5 w-5" />
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mt-5 mb-2">
              Multi-currency
            </h3>
            <p className="text-sm">Track in any currency</p>
          </div>

          <div className="p-5 bg-[#121212]/40 border border-white/8 rounded-lg w-55 shadow-lg shadow-white/5">
            <ChartNoAxesColumn className="opacity-65 h-5 w-5" />
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mt-5 mb-2">
              Analytics
            </h3>
            <div className="text-sm">
              <p>Monthly spending</p>
              <p>charts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs 2xl:text-sm text-center mb-8">
        <span className="text-white/40">Built by Pavlo · </span>
        <a
          href="https://github.com/shimiio"
          target="_blank"
          className="text-white/60 hover:text-white duration-150"
        >
          GitHub ↗
        </a>
      </div>

      {modal == "login" && <LoginModal onClose={() => setModal(null)} />}
      {modal == "signup" && <SignupModal onClose={() => setModal(null)} />}
    </div>
  );
}
