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
        <Silk
          speed={1}
          scale={0.7}
          color="#1f1d1f"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
      <RouterProvider router={router} />;
    </>
  );
}
