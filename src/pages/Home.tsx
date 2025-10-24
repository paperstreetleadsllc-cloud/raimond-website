import React from "react";
import Hero from "../sections/Hero";
import FeatureHighlights from "../sections/FeatureHighlights";
import CapabilitiesGrid from "../sections/CapabilitiesGrid";
import CTA from "../sections/CTA";
import Footer from "../shared/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureHighlights />
      <CapabilitiesGrid />
      <CTA />
      <Footer />
    </>
  );
}