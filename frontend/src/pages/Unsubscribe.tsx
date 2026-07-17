import Logo from "#components/ui/Logo";
import { useEffect, useState } from "react";

type UnsubscribeState = "loading" | "success" | "already" | "invalid" | "error";

export default function Unsubscribe() {
  const [state, setState] = useState<UnsubscribeState>("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setState("invalid");
      return;
    }

    const controller = new AbortController();

    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
      .then((res) => {
        if (res.status === 200) return setState("success");
        if (res.status === 404) return setState("invalid");
        if (res.status === 409) return setState("already");
        return setState("error");
      })
      .catch(() => setState("error"));
    return () => controller.abort();
  }, []);

  return (
    <div className="flex flex-col items-center mx-auto justify-between h-screen text-white">
      <div className="flex flex-col items-center mt-27 2xl:mt-37">
        <div className="flex flex-row items-center gap-1 mb-30">
          <span className="rounded-xl flex items-center justify-center text-indigo-400">
            <Logo />
          </span>
          <span className="text-2xl font-medium">Pare</span>
        </div>

        <UnsubscribeMessage state={state} />
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

function UnsubscribeMessage({ state }: { state: UnsubscribeState }) {
  switch (state) {
    case "loading":
      return <p className="text-white/60 text-lg font-bold">Loading</p>;
    case "success":
      return (
        <p className="text-green-300 text-lg font-bold">
          You will no longer receive reminders
        </p>
      );
    case "already":
      return (
        <p className="text-white/80 text-lg font-bold">
          You have already been unsubscribed from reminders
        </p>
      );
    case "invalid":
      return (
        <p className="text-red-300 text-lg font-bold">
          Link is invalid or outdated
        </p>
      );
    case "error":
      return (
        <div className="flex flex-col text-lg items-center">
          <p className="text-red-300 font-bold">Something went wrong</p>
          <p className="text-white/60 text-base">please try again later</p>
        </div>
      );
  }
}
