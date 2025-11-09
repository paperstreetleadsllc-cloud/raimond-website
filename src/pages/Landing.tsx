import React from "react";
import BackgroundFX from "../components/landing/BackgroundFX";
import Header from "../components/landing/Header";
import { HeroCurrent } from "../components/landing/HeroCurrent";
import { HeroV2 } from "../components/landing/HeroV2";
import MetricsBand from "../components/landing/MetricsBand";
import Benefits from "../components/landing/Benefits";
import FeatureGrid from "../components/landing/FeatureGrid";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import Integrations from "../components/landing/Integrations";
import CTA from "../components/landing/CTA";

// Feature flag: Enable V2 hero with HUD preview and bright CTA
const ENABLE_HERO_V2 = import.meta.env.VITE_RAIMOND_HERO_V2 === "true";

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      <BackgroundFX />
      <Header />
      {ENABLE_HERO_V2 ? <HeroV2 /> : <HeroCurrent />}
      {ENABLE_HERO_V2 && <MetricsBand />}
      <Benefits />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <Integrations />
      <CTA />
    </div>
  );
}
