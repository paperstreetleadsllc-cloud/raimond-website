import type { ReactNode } from "react";

interface TradingOsLayoutProps {
  sidebar: ReactNode;
  topBar: ReactNode;
  metrics: ReactNode;
  main: ReactNode;
  secondary: ReactNode;
}

export default function TradingOsLayout({
  sidebar,
  topBar,
  metrics,
  main,
  secondary
}: TradingOsLayoutProps) {
  return (
    <div className="min-h-screen bg-[#020510] text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-10 lg:px-10">
        {topBar}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="order-2 lg:order-1">{sidebar}</div>
          <div className="order-1 flex flex-col gap-8 lg:order-2">
            {metrics}
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
              {main}
              {secondary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}










