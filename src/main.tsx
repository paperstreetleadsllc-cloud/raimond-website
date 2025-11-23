import "@fontsource-variable/inter/index.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import App from "./pages/App";
import Home from "./pages/Home";
import JournalPage from "./pages/Journal";
import Login from "./pages/Login";
import Privacy from "./pages/Privacy";
import TradingOsPage from "./pages/TradingOsPage";
import Terms from "./pages/Terms";
import LoadingScreen from "./shared/LoadingScreen";
import ComingSoon from "./pages/ComingSoon";
import SignupPage from "./pages/Signup";
import ThankYouPage from "./pages/ThankYou";

function Root() {
  const [isLoading, setIsLoading] = React.useState(true);
  const timeoutRef = React.useRef<number>();
  const fallbackRef = React.useRef<number>();
  const marketingOnly = React.useMemo(
    () => (import.meta.env.VITE_MARKETING_ONLY ?? "false") === "true",
    []
  );

  const router = React.useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <App />,
          children: [
            { index: true, element: <Home /> },
            { path: "signup", element: <SignupPage /> },
            { path: "thank-you", element: <ThankYouPage /> },
            {
              path: "app",
              element: marketingOnly ? (
                <ComingSoon />
              ) : (
                <ProtectedRoute>
                  <TradingOsPage />
                </ProtectedRoute>
              )
            },
            {
              path: "dashboard",
              element: marketingOnly ? (
                <ComingSoon />
              ) : (
                <ProtectedRoute>
                  <TradingOsPage />
                </ProtectedRoute>
              )
            },
            { path: "journal", element: <JournalPage /> },
            { path: "privacy", element: <Privacy /> },
            { path: "terms", element: <Terms /> }
          ]
        },
        {
          path: "/login",
          element: marketingOnly ? <ComingSoon /> : <Login />
        }
      ]),
    [marketingOnly]
  );

  React.useEffect(() => {
    const MIN_DURATION = 1700;
    const startTime = performance.now();
    let resolved = false;

    const resolve = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(MIN_DURATION - elapsed, 0);
      timeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
      }, remaining);
    };

    if (document.readyState === "complete") {
      resolve();
    } else {
      window.addEventListener("load", resolve);
    }

    fallbackRef.current = window.setTimeout(resolve, MIN_DURATION + 1200);

    return () => {
      window.removeEventListener("load", resolve);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (fallbackRef.current) {
        window.clearTimeout(fallbackRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

