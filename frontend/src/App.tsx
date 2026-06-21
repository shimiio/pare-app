// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAuthStore } from "./store/useAuthStore";
import { refresh } from "./api/auth";
import Silk from "./components/Silk";

export default function App() {
  const setToken = useAuthStore((state) => state.setToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await refresh();
        setToken(response.data.jwtToken);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setToken, clearAuth, setLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
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
