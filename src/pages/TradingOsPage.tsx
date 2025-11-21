import {
  MarketActivity,
  MetricsRow,
  NewsAndSignals,
  OrderflowPanel,
  PositionsPanel,
  SidebarNav,
  TopBar,
  TradingOsLayout
} from "../features/tradingOs";

export default function TradingOsPage() {
  return (
    <TradingOsLayout
      sidebar={<SidebarNav />}
      topBar={<TopBar />}
      metrics={<MetricsRow />}
      main={
        <div className="flex flex-col gap-6">
          <MarketActivity />
          <div className="grid gap-6 xl:grid-cols-2">
            <OrderflowPanel />
            <PositionsPanel />
          </div>
        </div>
      }
      secondary={<NewsAndSignals />}
    />
  );
}









