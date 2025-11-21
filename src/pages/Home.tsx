import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  HeroSection,
  TrustStrip,
  WhyRAimondSection,
  NeuralArchitectureDiagram,
  HUDShowcase,
  PersonaCards,
  FeaturesSection,
  GovernanceLayerDemo,
  PhilosophySection,
  TestimonialsSection,
  PricingSection,
  CtaStrip
} from "../features/marketing";
import type { AppOutletContext } from "./App";

/*
  / Home page structure:
  <main>
    <HeroSection />
    <TrustStrip />
    <WhyRAimondSection />
    <NeuralArchitectureDiagram />
    <HUDShowcase />
    <PersonaCards />
    <FeaturesSection />
    <GovernanceLayerDemo />
    <PhilosophySection />
    <TestimonialsSection />
    <PricingSection />
    <CtaStrip />
  </main>
*/
export default function Home() {
  const { openWaitlist } = useOutletContext<AppOutletContext>();

  const handleWaitlistOpen = React.useCallback(() => {
    openWaitlist();
  }, [openWaitlist]);

  const handleExplore = React.useCallback(() => {
    const section = document.getElementById("features");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleTalk = React.useCallback(() => {
    window.location.href = "mailto:hello@raimondai.com";
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--night-900)]">
      <main className="flex-1">
        <HeroSection onPrimaryCta={handleWaitlistOpen} onSecondaryCta={handleExplore} />
        <TrustStrip />
        <WhyRAimondSection />
        <NeuralArchitectureDiagram />
        <HUDShowcase />
        <PersonaCards />
        <FeaturesSection />
        <GovernanceLayerDemo />
        <PhilosophySection />
        <TestimonialsSection />
        <PricingSection />
        <CtaStrip onPrimaryAction={handleWaitlistOpen} onSecondaryAction={handleTalk} />
      </main>
    </div>
  );
}
