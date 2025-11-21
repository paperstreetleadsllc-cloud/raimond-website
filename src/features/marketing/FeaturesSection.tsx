import { Brain, Target, Shield, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Order Flow Intelligence",
      description: "Advanced algorithms analyze market microstructure in real-time, revealing institutional activity and smart money movements before they show on price.",
      color: "#1FF0DA",
    },
    {
      icon: Brain,
      title: "Cognitive Bias Guardrails",
      description: "AI-powered behavioral analysis detects emotional trading patterns and automatically suggests discipline-enhancing interventions to keep you in the zone.",
      color: "#4a90e2",
    },
    {
      icon: Target,
      title: "Discipline Automation Engine",
      description: "Pre-program your ideal trading rules and let RAimond enforce them. No more override anxiety or impulse trades that break your system.",
      color: "#b794f6",
    },
    {
      icon: Shield,
      title: "Market Structure Overlay HUD",
      description: "See VWAP bands, delta curves, and key liquidity levels overlaid on your charts. Trade with context, not guesswork.",
      color: "#f093fb",
    },
    {
      icon: Zap,
      title: "Lightning Execution Layer",
      description: "Sub-12ms order routing with smart order flow optimization. Get filled at better prices with institutional-grade execution technology.",
      color: "#ff6b9d",
    },
  ];

  return (
    <section id="features" className="relative section-padding-md">
      <div className="absolute inset-0 neural-grid-subtle opacity-8" />
      
      <div className="relative container mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-block mb-6">
            <div className="px-5 py-2.5 rounded-full bg-[#1FF0DA]/5 border border-[#1FF0DA]/20">
              <span className="text-[#1FF0DA] text-sm tracking-wide">Platform Features</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-8 font-['Space_Grotesk']">
            Next-Gen Trading Intelligence
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Every feature engineered to give you an unfair advantage in modern futures markets.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="glass-card card-radius-sm p-8 h-full relative overflow-hidden hover:border-[#1FF0DA]/30 transition-all duration-500 hover:shadow-[0_0_25px_rgba(31,240,218,0.12)] hover:-translate-y-1">
                {/* Enhanced Background Gradient - More subtle */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at top left, ${feature.color}08 0%, transparent 70%)`
                  }}
                />
                
                {/* Icon */}
                <div className="relative mb-8">
                  <div
                    className="relative w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}08)`,
                      border: `1px solid ${feature.color}25`,
                    }}
                  >
                    <feature.icon size={28} style={{ color: feature.color }} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl mb-5 font-['Space_Grotesk'] group-hover:text-[#1FF0DA] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Enhanced Hover Effect Border - Simplified */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.color}40, transparent)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
