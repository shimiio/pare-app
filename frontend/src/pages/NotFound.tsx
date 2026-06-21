import Logo from "#components/ui/Logo";
import { Link } from "react-router-dom";

// pages/NotFound.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center mx-auto justify-between h-screen text-white">
      <div className="flex flex-col items-center mt-27 2xl:mt-37">
        <div className="flex flex-row items-center gap-1 mb-30">
          <span className="rounded-xl flex items-center justify-center text-indigo-400">
            <Logo />
          </span>
          <span className="text-2xl font-medium">Pare</span>
        </div>

        <div className="text-3xl font-bold mb-2 text-center text-red-300">
          404
        </div>

        <p className="mb-11.5 text-neutral-400 text-center text-sm">
          Page not found
        </p>

        <Link
          className="px-4 py-2 bg-linear-to-br from-pink-400/15 via-violet-500/10 backdrop-blur-xs to-blue-500/20 border border-white/5 hover:bg-violet-400/5 rounded-lg font-medium duration-150 shadow-md shadow-indigo-600/10 cursor-pointer"
          to="/"
        >
          Go Home
        </Link>
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
    </div>
  );
}
