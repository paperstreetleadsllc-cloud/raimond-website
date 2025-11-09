import React from 'react';
import BackgroundFX from '../components/BackgroundFX';
import Hero from '../components/Hero';
import HeroCurrent from '../components/landing/HeroCurrent';
import HeroV2 from '../components/landing/HeroV2';
import KPITiles from '../components/KPITiles';
import FeatureRow from '../components/FeatureRow';
import EquityCurveCard from '../components/Charts/EquityCurveCard';
import OrderflowHeatmapCard from '../components/Charts/OrderflowHeatmapCard';
import StatsDiscipline from '../components/StatsDiscipline';
import TestimonialsStrip from '../components/TestimonialsStrip';
import Pricing from '../components/Pricing';

export default function Home() {
  // Feature flag: VITE_RAIMOND_HERO_V2
  // Set to "true" in Vercel preview environment to enable Hero V2
  // Production remains on current hero unless flag is enabled
  const useHeroV2 = import.meta.env.VITE_RAIMOND_HERO_V2 === 'true';

  return (
    <main>
      <BackgroundFX />

      {/* Conditionally render Hero V2 or Current based on feature flag */}
      {useHeroV2 ? <HeroV2 /> : <HeroCurrent />}

      <KPITiles />

      <FeatureRow
        index={0}
        title="Make fewer decisions. Make better ones."
        lede="RAimond eliminates guesswork by enforcing your rules in real time. No hesitation. No second-guessing. Just execution when the odds align."
        bullets={[
          'Adaptive HUD that responds to market conditions',
          'Real-time rule enforcement and cooldowns',
          'Position sizing calculated automatically',
          'Session reviews that learn your behavior',
        ]}
        image={<EquityCurveCard />}
      />

      <FeatureRow
        index={1}
        title="Read order flow like a pro."
        lede="Volume tells the truth. RAimond analyzes order flow and VWAP structure to give you context without the noise."
        bullets={[
          'Real-time order flow visualization',
          'VWAP structure with context bands',
          'Volume profile analysis',
          'Institutional footprint tracking',
        ]}
        image={<OrderflowHeatmapCard />}
      />

      <StatsDiscipline />

      <TestimonialsStrip />

      <Pricing />
    </main>
  );
}
