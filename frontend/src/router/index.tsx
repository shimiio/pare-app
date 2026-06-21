import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layouts/AppLayout";
import Dashboard from "../pages/Dashboard";
import Subscriptions from "../pages/Subscriptions";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";
import PublicLayout from "../components/layouts/PublicLayout";
import MainWindow from "../pages/MainWindow";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  // PUBLIC ROUTES
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/",
        element: <PublicLayout />,
        children: [{ index: true, element: <MainWindow /> }],
      },
    ],
  },

  // PROTECTED ROUTES
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "subscriptions", element: <Subscriptions /> },
          { path: "analytics", element: <Analytics /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },

  // 404 route
  { path: "*", element: <NotFound /> },
]);
