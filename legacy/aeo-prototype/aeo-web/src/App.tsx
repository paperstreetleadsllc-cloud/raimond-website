import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import AuditPage from "./pages/AuditPage";
import LandingPage from "./pages/LandingPage";
import PlanPage from "./pages/PlanPage";
import PricingPage from "./pages/PricingPage";
import SiteDetailPage from "./pages/SiteDetailPage";
import SitesPage from "./pages/SitesPage";

export default function App() {
  const buildMarker = (import.meta.env.VITE_BUILD_ID as string | undefined)?.trim() || "AEO";

  return (
    <>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="sites/:id" element={<SiteDetailPage />} />
          <Route path="sites/:id/audit" element={<AuditPage />} />
          <Route path="sites/:id/plan" element={<PlanPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <footer className="pointer-events-none fixed bottom-2 right-3 z-50 text-[10px] text-slate-400/70">
        paperstreetleads AEO build: {buildMarker}
      </footer>
    </>
  );
}
