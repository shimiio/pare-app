import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAuthStore } from "./store/useAuthStore";

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    initializeAuth(token);
  }, [initializeAuth]);

  return <RouterProvider router={router} />;
}
