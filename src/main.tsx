import "@fontsource-variable/inter/index.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./pages/App";
import Home from "./pages/Home";
import JournalPage from "./pages/Journal";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const router = createBrowserRouter([
  { path: "/", element: <App />, children: [
    { index: true, element: <Home /> },
    { path: "journal", element: <JournalPage /> },
    { path: "privacy", element: <Privacy /> },
    { path: "terms", element: <Terms /> },
  ]},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);