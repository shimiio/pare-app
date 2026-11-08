import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAuthStore } from "./store/useAuthStore";
import axios from "axios";
import { refreshSession, isSessionEnded } from "./api/auth";
import Silk from "./components/Silk";
import LoadingState from "./components/ui/LoadingState";

const STARTUP_REFRESH_ATTEMPTS = 3;

// Wait as long as the server asks (Retry-After on a 429), otherwise 1s, 2s, ...; at most 5s
const retryDelayMs = (error: unknown, attempt: number) => {
  const retryAfter = axios.isAxiosError(error) ? Number(error.response?.headers["retry-after"]) : NaN;
  const ms = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt;
  return Math.min(ms, 5000);
};

export default function App() {
  const setToken = useAuthStore((state) => state.setToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      for (let attempt = 1; ; attempt++) {
        try {
          const token = await refreshSession();
          if (!cancelled) setToken(token);
          break;
        } catch (error) {
          // Logged out only when the server says the session is over, or after a few failed tries
          if (isSessionEnded(error) || attempt === STARTUP_REFRESH_ATTEMPTS) {
            if (!cancelled) clearAuth();
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs(error, attempt - 1)));
          if (cancelled) return;
        }
      }
      if (!cancelled) setLoading(false);
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [setToken, clearAuth, setLoading]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#121212]">
        <LoadingState />
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <svg className="absolute w-0 h-0" width="0" height="0">
          <defs>
            <linearGradient
              id="my-lucide-gradient"
              x1="0"
              y1="0"
              x2="24"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ec4899" />{/* Tailwind pink-500 */}
              <stop offset="50%" stopColor="#8b5cf6" />{/* Tailwind violet-500 */}
              <stop offset="100%" stopColor="#3b82f6" />{/* Tailwind blue-500 */}
            </linearGradient>
          </defs>
        </svg>

        <Silk
          speed={1.5}
          scale={0.7}
          color="#212121"
          noiseIntensity={1.7}
          rotation={0}
        />
      </div>
      <RouterProvider router={router} />
    </>
  );
}
