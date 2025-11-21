import { motion } from "framer-motion";
import { Database, Brain, Shield, Zap, Activity } from "lucide-react";

const stages = [
  {
    icon: Database,
    title: "Market Microstructure Feed",
    description: "Real-time delta, VWAP, and liquidity data ingestion",
    color: "#4a90e2"
  },
  {
    icon: Brain,
    title: "Trainable Neural Intelligence",
    description: "Adaptive learning of order flow patterns and bias detection",
    color: "#1FF0DA"
  },
  {
    icon: Shield,
    title: "Discipline Guardrails",
    description: "Governance layer enforcing risk rules and emotional overrides",
    color: "#b794f6"
  },
  {
    icon: Zap,
    title: "HUD Output",
    description: "Clean, actionable insights delivered in real-time",
    color: "#1FF0DA"
  },
  {
    icon: Activity,
    title: "Execution Behavior",
    description: "Automated alerts and intelligent order suggestions",
    color: "#4a90e2"
  }
];

export function NeuralArchitectureDiagram() {
  return (
    <section id="architecture" className="relative section-padding-md overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]" />
      <div className="absolute inset-0 neural-grid-medium opacity-10" />
      
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
              <span className="text-[#1FF0DA] text-sm tracking-wide">Neural Architecture</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-8 font-['Space_Grotesk']">
            How <span className="text-[#1FF0DA]">RAimond</span> Thinks
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            A five-stage cognitive pipeline transforming market data into disciplined execution
          </p>
        </motion.div>
        
        {/* Architecture Flow */}
        <div className="relative">
          {/* Enhanced Connection Rail with Glow - Thinner, more delicate */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(31, 240, 218, 0.2) 20%, rgba(31, 240, 218, 0.2) 80%, transparent 100%)",
                boxShadow: "0 0 12px rgba(31, 240, 218, 0.2)"
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
            />
            
            {/* Animated Pulse traveling along the rail - Smaller, more refined */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#1FF0DA]"
              style={{
                boxShadow: "0 0 12px rgba(31, 240, 218, 0.5)"
              }}
              initial={{ left: "0%" }}
              animate={{ left: ["0%", "100%", "0%"] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: 2
              }}
            />
          </div>
          
          {/* Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 relative">
            {stages.map((stage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Card */}
                <div className="glass-card card-radius-sm p-8 h-full relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_25px_rgba(31,240,218,0.12)]">
                  {/* Gradient Overlay - Reduced intensity */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at top, ${stage.color}08 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <div
                      className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center relative"
                      style={{
                        background: `${stage.color}10`,
                        border: `1px solid ${stage.color}30`
                      }}
                    >
                      <stage.icon size={28} style={{ color: stage.color }} />
                      
                      {/* Pulse Effect - Reduced */}
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{ border: `1px solid ${stage.color}` }}
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.4
                        }}
                      />
                    </div>
                    
                    {/* Stage Number */}
                    <div
                      className="text-xs mb-4 tracking-wider opacity-60 font-['Space_Grotesk']"
                      style={{ color: stage.color }}
                    >
                      STAGE {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg mb-5 min-h-[3.5rem] font-['Space_Grotesk'] leading-tight">
                      {stage.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                  
                  {/* Connection Arrow (Desktop) - Simplified */}
                  {index < stages.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 z-20"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#0a0e1a] border border-[#1FF0DA]/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#1FF0DA]">
                          <motion.div
                            className="w-2 h-2 rounded-full bg-[#1FF0DA]"
                            animate={{
                              scale: [1, 1.6, 1],
                              opacity: [1, 0, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.3
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 glass-card rounded-full px-6 py-3.5">
            <div className="w-2 h-2 rounded-full bg-[#1FF0DA] animate-pulse" />
            <span className="text-sm text-gray-400">
              Average processing latency: <span className="text-[#1FF0DA]">&lt;2.3ms</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
