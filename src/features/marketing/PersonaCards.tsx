import { motion } from "framer-motion";
import { Zap, Target, TrendingUp, Award, Clock, Shield, BarChart3, CheckCircle2 } from "lucide-react";

const personas = [
  {
    type: "Scalper",
    tagline: "Precision + Timing",
    description: "Execute with sub-second accuracy in high-frequency environments",
    benefits: [
      { icon: Zap, text: "High-frequency execution alerts" },
      { icon: Target, text: "Tick-level entry precision" },
      { icon: Shield, text: "Overtrading guardrails" }
    ],
    color: "#1FF0DA", // Precision teal
    gradient: "from-[#1FF0DA]/20 to-transparent"
  },
  {
    type: "Futures Day Trader",
    tagline: "Discipline + Bias Detection",
    description: "Navigate intraday volatility with intelligent bias tracking",
    benefits: [
      { icon: TrendingUp, text: "Real-time bias shifts" },
      { icon: Shield, text: "Emotional override protection" },
      { icon: BarChart3, text: "VWAP & delta analysis" }
    ],
    color: "#4a90e2", // Structure blue
    gradient: "from-[#4a90e2]/20 to-transparent"
  },
  {
    type: "Swing Trader",
    tagline: "Structure + Clean Overlays",
    description: "Multi-timeframe clarity without chart clutter",
    benefits: [
      { icon: BarChart3, text: "Key level identification" },
      { icon: Clock, text: "Multi-session tracking" },
      { icon: CheckCircle2, text: "Clean HUD interface" }
    ],
    color: "#b794f6", // Structure purple
    gradient: "from-[#b794f6]/20 to-transparent"
  },
  {
    type: "Prop Firm Trader",
    tagline: "Consistency + Risk Rules",
    description: "Stay funded with automated compliance and risk management",
    benefits: [
      { icon: Award, text: "Drawdown protection" },
      { icon: Shield, text: "Auto-compliance enforcement" },
      { icon: Target, text: "Consistency metrics" }
    ],
    color: "#f093fb", // Compliance pink
    gradient: "from-[#f093fb]/20 to-transparent"
  }
];

export function PersonaCards() {
  return (
    <section id="personas" className="relative section-padding-md overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]" />
      <div className="absolute inset-0 neural-grid-medium opacity-8" />
      
      <div className="relative container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-block mb-6">
            <div className="px-5 py-2.5 rounded-full bg-[#1FF0DA]/5 border border-[#1FF0DA]/20">
              <span className="text-[#1FF0DA] text-sm tracking-wide">Built For Traders</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-8 font-['Space_Grotesk']">
            Who <span className="text-[#1FF0DA]">RAimond</span> Elevates
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Tailored intelligence for every trading style and discipline requirement
          </p>
        </motion.div>
        
        {/* Persona Grid - Increased gap for more air */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {personas.map((persona, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Card - Enhanced padding and spacing */}
              <div className="glass-card card-radius-sm p-8 h-full relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(31,240,218,0.15)] hover:-translate-y-2">
                {/* Gradient Background - More subtle */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${persona.gradient} opacity-0 group-hover:opacity-80 transition-opacity duration-500`}
                />
                
                {/* Border Glow on Hover - Reduced intensity */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    border: `1px solid ${persona.color}30`,
                    boxShadow: `0 0 15px ${persona.color}20`
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Persona Type */}
                  <div className="mb-6">
                    <h3 className="text-xl mb-3 font-['Space_Grotesk']" style={{ color: persona.color }}>
                      {persona.type}
                    </h3>
                    <div className="text-sm text-gray-400 italic tracking-wide">
                      {persona.tagline}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-8 leading-relaxed">
                    {persona.description}
                  </p>
                  
                  {/* Benefits */}
                  <div className="mt-auto space-y-4">
                    {persona.benefits.map((benefit, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + i * 0.1 }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${persona.color}15`, border: `1px solid ${persona.color}20` }}
                        >
                          <benefit.icon size={16} style={{ color: persona.color }} />
                        </div>
                        <span className="text-gray-300">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Hover Indicator */}
                  <motion.div
                    className="mt-8 pt-5 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ borderColor: `${persona.color}15` }}
                  >
                    <div className="flex items-center gap-2 text-xs" style={{ color: persona.color }}>
                      <span>Learn more</span>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
