import Logo from "./Logo";

export default function MobileVersionWarning() {
  return (
    <div className="flex flex-col items-center mx-auto justify-between h-screen md:hidden text-white">
      <div className="flex flex-col items-center mt-20">
        <div className="flex flex-row items-center gap-1 mb-15">
          <span className="rounded-xl flex items-center justify-center text-indigo-400">
            <Logo />
          </span>
          <span className="text-2xl font-medium">Pare</span>
        </div>
        <div className="flex flex-col font-bold text-center px-4 gap-1">
          <p>Pare is currently only available on desktop.</p>
          <p>A mobile version may be available in the future.</p>
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
    </div>
  );
}
