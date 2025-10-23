import React from "react";
import Hero from "../sections/Hero";
import FeatureHighlights from "../sections/FeatureHighlights";
import CapabilitiesGrid from "../sections/CapabilitiesGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureHighlights />
      <CapabilitiesGrid />
    </>
  );
}