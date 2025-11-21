import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Lock, CheckCircle2, type LucideIcon } from "lucide-react";

type ScenarioKey = "warning" | "enforcement" | "recovery";

type Scenario = {
  title: string;
  description: string;
  alert: string;
  message: string;
  color: string;
  icon: LucideIcon;
};

const scenarios: Record<ScenarioKey, Scenario> = {
  warning: {
    title: "Early Warning Detection",
    description: "RAimond identifies risk patterns before they escalate",
    alert: "Max Loss Limit Approaching",
    message: "Current session loss: $180 of $200 limit. Consider reducing position size.",
    color: "#f093fb",
    icon: AlertTriangle
  },
  enforcement: {
    title: "Discipline Enforcement",
    description: "Automated protection when rules are breached",
    alert: "Execution Locked",
    message: "Daily loss limit reached. Trading disabled until next session.",
    color: "#ff4466",
    icon: Lock
  },
  recovery: {
    title: "Behavioral Correction",
    description: "Intelligent guidance back to systematic trading",
    alert: "Emotional Override Detected",
    message: "Revenge trading pattern identified. Returning to system rules. Take a 15-minute break.",
    color: "#1FF0DA",
    icon: CheckCircle2
  }
};

export default function GovernanceLayerDemo() {
  const [activeDemo, setActiveDemo] = useState<ScenarioKey>("warning");
  const currentScenario = scenarios[activeDemo];
  const scenarioEntries = Object.entries(scenarios) as Array<[
    ScenarioKey,
    Scenario
  ]>;

  return (
    <section id="governance" className="relative section-padding-md overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]" />
        <div className="absolute inset-0 neural-grid-subtle opacity-15" />
        <motion.div
          className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${currentScenario.color}30 0%, transparent 70%)` }}
          key={activeDemo}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div className="relative container mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-block mb-6">
            <div className="px-5 py-2.5 rounded-full bg-[#1FF0DA]/5 border border-[#1FF0DA]/20">
              <span className="text-[#1FF0DA] text-sm tracking-wide">Governance Layer</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-8 font-['Space_Grotesk']">
            Your <span className="text-[#1FF0DA]">Discipline</span> Shield
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            RAimond's secret weapon: clinical protection that feels empowering, not restrictive
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-5 mb-16">
          {scenarioEntries.map(([key, scenario]) => {
            const isActive = activeDemo === key;
            const Icon = scenario.icon;
            return (
              <motion.button
                key={key}
                onClick={() => setActiveDemo(key)}
                className={`glass-card rounded-xl px-6 py-4 transition-all duration-300 ${
                  isActive ? "shadow-[0_0_20px_rgba(31,240,218,0.15)]" : ""
                }`}
                style={{ border: isActive ? `1px solid ${scenario.color}40` : "1px solid rgba(31, 240, 218, 0.15)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${scenario.color}15`, border: `1px solid ${scenario.color}20` }}
                  >
                    <Icon size={20} style={{ color: scenario.color }} />
                  </div>
                  <div className="text-left">
                    <div className="font-['Space_Grotesk']">{scenario.title}</div>
                    <div className="text-xs text-gray-400">{scenario.description}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div
              className="glass-card rounded-2xl p-10 relative overflow-hidden"
              style={{ border: `1px solid ${currentScenario.color}30`, boxShadow: `0 0 25px ${currentScenario.color}15` }}
            >
              <motion.div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle, ${currentScenario.color} 1px, transparent 1px)`,
                  backgroundSize: "30px 30px"
                }}
                animate={{ backgroundPosition: ["0px 0px", "30px 30px"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-start gap-5 flex-1">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.8 }}
                    >
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${currentScenario.color}15`, border: `1px solid ${currentScenario.color}30` }}
                      >
                        <Shield size={32} style={{ color: currentScenario.color }} />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{ border: `1px solid ${currentScenario.color}` }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    </motion.div>

                    <div className="flex-1">
                      <motion.div
                        className="text-2xl mb-3 font-['Space_Grotesk']"
                        style={{ color: currentScenario.color }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {currentScenario.alert}
                      </motion.div>
                      <motion.div
                        className="text-gray-300 text-lg leading-relaxed"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {currentScenario.message}
                      </motion.div>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="glass-card rounded-xl p-6 mb-8"
                  style={{ borderLeft: `2px solid ${currentScenario.color}` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-[#1FF0DA]/10 flex items-center justify-center flex-shrink-0 border border-[#1FF0DA]/20">
                      <span className="text-[#1FF0DA]">RAi</span>
                    </div>
                    <div className="flex-1 text-xs text-gray-400 leading-relaxed">
                      {activeDemo === "warning" &&
                        "I've noticed you're approaching your risk threshold. This is a protective alert. Would you like me to reduce position sizing automatically?"}
                      {activeDemo === "enforcement" &&
                        "Your trading account is now protected. I've disabled new order entry to preserve capital. Reset available at market open tomorrow."}
                      {activeDemo === "recovery" &&
                        "I've detected elevated emotional state based on trade frequency and deviation from your plan. Let's return to systematic execution. Your edge is in discipline, not volume."}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      className="rounded-lg border px-5 py-2.5 text-sm"
                      style={{
                        backgroundColor: `${currentScenario.color}15`,
                        borderColor: `${currentScenario.color}30`,
                        color: currentScenario.color
                      }}
                      whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${currentScenario.color}30` }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeDemo === "warning" && (
                        <span className="flex items-center gap-2">
                          Enable Auto-Sizing <span className="text-xs opacity-70">●</span>
                        </span>
                      )}
                      {activeDemo === "enforcement" && "Acknowledge & Review"}
                      {activeDemo === "recovery" && "Take Break"}
                    </motion.button>
                    <motion.button
                      className="rounded-lg border border-[#1FF0DA]/20 bg-[#1a2332] px-5 py-2.5 text-sm text-gray-300 hover:border-[#1FF0DA]/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeDemo === "warning" && "Continue Monitoring"}
                      {activeDemo === "enforcement" && "View Session Report"}
                      {activeDemo === "recovery" && "Review Trade Plan"}
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  className="grid grid-cols-3 gap-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {[
                    { label: "Protection Level", value: "Active" },
                    { label: "Rules Enforced", value: "Always on during sessions" },
                    { label: "Override Blocks", value: "Documented in session log" }
                  ].map((stat) => (
                    <div key={stat.label} className="glass-card rounded-lg p-5 text-center">
                      <div className="text-xs text-gray-400 mb-2 tracking-wide">{stat.label}</div>
                      <div className="text-lg text-[#1FF0DA] font-['Space_Grotesk']">{stat.value}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 italic text-lg">"Protection that feels like partnership, not punishment"</p>
        </motion.div>
      </div>
    </section>
  );
}
