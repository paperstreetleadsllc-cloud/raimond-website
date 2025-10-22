import React from "react";
import Hero from "../sections/Hero";
import CoachStrip from "../sections/CoachStrip";
import HowItLearns from "../sections/HowItLearns";
import Features from "../sections/Features";
import CTA from "../sections/CTA";

export default function Home(){
  return (
    <>
      <Hero />
      <CoachStrip />
      <HowItLearns />
      <Features />
      <CTA />
    </>
  );
}