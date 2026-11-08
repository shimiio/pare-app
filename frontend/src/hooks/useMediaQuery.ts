import { useCallback, useSyncExternalStore } from "react";

// Same breakpoint as Tailwind's md: (48rem), where the phone layout switches to the desktop one
export const DESKTOP_QUERY = "(min-width: 48rem)";

// Whether a CSS media query matches right now; re-renders when that changes (rotation, resize)
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
