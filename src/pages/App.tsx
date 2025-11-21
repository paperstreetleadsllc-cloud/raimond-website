import React, { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../shared/Header";
import Footer from "../shared/Footer";
import { MarketingFooter } from "../features/marketing";
import WaitlistModal from "../features/marketing/WaitlistModal";

export type AppOutletContext = {
  openWaitlist: () => void;
};

export default function App() {
  const location = useLocation();
  const isMarketingRoute = location.pathname === "/";

  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const openWaitlist = useCallback(() => setWaitlistOpen(true), []);
  const closeWaitlist = useCallback(() => setWaitlistOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onOpenWaitlist={openWaitlist} />
      <main className="flex-1">
        <Outlet context={{ openWaitlist }} />
      </main>
      {isMarketingRoute ? <MarketingFooter /> : <Footer />}
      <WaitlistModal open={waitlistOpen} onClose={closeWaitlist} />
    </div>
  );
}
