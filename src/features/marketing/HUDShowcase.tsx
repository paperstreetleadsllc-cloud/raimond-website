import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, Activity } from "lucide-react";
import { RAimondGlyph } from "./RAimondGlyph";

export function HUDShowcase() {
  return (
    <section id="hud" className="relative section-padding-md overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]" />
      <div className="absolute inset-0 neural-grid-dense opacity-8" />
      
      <div className="relative container mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Main HUD Container */}
          <div className="relative glass-card card-radius-md p-10 overflow-hidden border border-[#1FF0DA]/20 shadow-2xl shadow-[#1FF0DA]/10">
            {/* Animated Border Glow - Reduced */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, rgba(31, 240, 218, 0.15), rgba(74, 144, 226, 0.15), rgba(31, 240, 218, 0.15))",
                backgroundSize: "200% 100%"
              }}
              animate={{
                backgroundPosition: ["0% 0%", "200% 0%", "0% 0%"]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-10 pb-5 border-b border-[#1FF0DA]/10">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <RAimondGlyph size={40} animated={false} />
                    {/* Loading Ring - Thinner */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: "1px solid transparent",
                        borderTopColor: "#1FF0DA",
                        borderRightColor: "#1FF0DA"
                      }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-['Space_Grotesk'] mb-1">RAimond HUD</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-[#1FF0DA] animate-pulse" />
                      <span>ES • 1m Chart • LIVE</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 text-xs">
                  <div>
                    <span className="text-gray-500">Latency:</span>
                    <span className="text-[#1FF0DA] ml-2">2.3ms</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Session Bias:</span>
                    <motion.span
                      className="ml-2"
                      initial={{ color: "#8b95ab" }}
                      animate={{ color: "#1FF0DA" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    >
                      Neutral → Bullish
                    </motion.span>
                  </div>
                </div>
              </div>
              
              {/* Main Chart Area */}
              <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Left: Chart Visualization */}
                <div className="lg:col-span-2">
                  <div className="relative h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#0a0e1a] to-[#131926] p-5 border border-[#1FF0DA]/10">
                    {/* VWAP Bands Visualization */}
                    <div className="relative h-full flex items-end justify-around gap-1">
                      {[...Array(60)].map((_, i) => {
                        const height = 30 + Math.sin(i / 5) * 20 + Math.random() * 15;
                        const isSignal = i === 42;
                        return (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-t relative"
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{
                              duration: 0.5,
                              delay: i * 0.01
                            }}
                            style={{
                              background: isSignal
                                ? "linear-gradient(to top, rgba(31, 240, 218, 0.6), rgba(31, 240, 218, 0.2))"
                                : i % 3 === 0
                                ? "linear-gradient(to top, rgba(74, 144, 226, 0.3), rgba(74, 144, 226, 0.08))"
                                : "linear-gradient(to top, rgba(31, 240, 218, 0.2), rgba(31, 240, 218, 0.04))",
                            }}
                          >
                            {isSignal && (
                              <motion.div
                                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                              >
                                <div className="bg-[#1FF0DA] text-[#0a0e1a] px-2.5 py-1 rounded text-xs">
                                  Entry Signal
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* VWAP Line Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <motion.path
                          d="M 0 50 Q 25 45, 50 48 T 100 52"
                          stroke="#1FF0DA"
                          strokeWidth="0.4"
                          fill="none"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.6 }}
                          transition={{ duration: 2, delay: 0.5 }}
                        />
                      </svg>
                    </div>
                    
                    {/* Key Levels */}
                    <div className="absolute top-5 right-5 space-y-2">
                      {[
                        { label: "Resistance", value: "5,247.50", color: "#ff4466" },
                        { label: "VWAP", value: "5,243.25", color: "#1FF0DA" },
                        { label: "Support", value: "5,239.00", color: "#4a90e2" }
                      ].map((level, i) => (
                        <motion.div
                          key={i}
                          className="glass-card rounded-lg px-3 py-2 text-xs"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: level.color }}
                            />
                            <span className="text-gray-400">{level.label}:</span>
                            <span style={{ color: level.color }}>{level.value}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right: Delta Curves & Metrics */}
                <div className="space-y-5">
                  {/* Delta Curve */}
                  <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400 tracking-wide">Delta Curve</span>
                      <TrendingUp size={16} className="text-[#1FF0DA]" />
                    </div>
                    <div className="h-32 relative">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <motion.path
                          d="M 0 80 Q 20 70, 40 65 T 80 50 Q 90 40, 100 30"
                          stroke="url(#deltaGradient)"
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                        <defs>
                          <linearGradient id="deltaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4a90e2" />
                            <stop offset="100%" stopColor="#1FF0DA" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="text-2xl text-[#1FF0DA] font-['Space_Grotesk'] mt-2">+247</div>
                  </div>
                  
                  {/* Order Flow */}
                  <div className="glass-card rounded-xl p-5">
                    <div className="text-sm text-gray-400 mb-3 tracking-wide">Order Flow</div>
                    <div className="text-xl text-[#1FF0DA] mb-4 font-['Space_Grotesk']">Bullish</div>
                    <div className="h-2 bg-[#0a0e1a] rounded-full overflow-hidden border border-[#1FF0DA]/10">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#1FF0DA] to-[#4a90e2]"
                        initial={{ width: "0%" }}
                        animate={{ width: "73%" }}
                        transition={{ duration: 1, delay: 0.8 }}
                      />
                    </div>
                  </div>
                  
                  {/* Session Stats */}
                  <div className="glass-card rounded-xl p-5 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="text-[#1FF0DA]">78%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg RR</span>
                      <span className="text-[#1FF0DA]">2.4:1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-[#1FF0DA]">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Governance Alerts */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  className="glass-card rounded-xl p-5 border-l border-[#1FF0DA]/40"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1FF0DA]/10 flex items-center justify-center flex-shrink-0 border border-[#1FF0DA]/20">
                      <CheckCircle2 size={20} className="text-[#1FF0DA]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm mb-2 font-['Space_Grotesk']">RAi Suggestion</div>
                      <div className="text-xs text-gray-400 leading-relaxed">
                        Strong buy confluence detected. VWAP alignment + positive delta flow. Consider entry 5,243.50
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  className="glass-card rounded-xl p-5 border-l border-[#4a90e2]/40"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#4a90e2]/10 flex items-center justify-center flex-shrink-0 border border-[#4a90e2]/20">
                      <Activity size={20} className="text-[#4a90e2]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm mb-2 font-['Space_Grotesk']">Governance Active</div>
                      <div className="text-xs text-gray-400 leading-relaxed">
                        Max position size: 4 contracts. Risk limit: $200. Stop loss enforced at 5,239.75
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
