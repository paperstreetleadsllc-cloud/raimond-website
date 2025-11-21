import { motion } from "framer-motion";
import { Brain, Heart, Target, TrendingUp } from "lucide-react";

const reasons = [
  {
    icon: Brain,
    title: "Traders Deserve Better Intelligence",
    description: "Institutional firms have had AI-powered execution for years. Independent traders shouldn't be left behind.",
    color: "#1FF0DA"
  },
  {
    icon: Heart,
    title: "Discipline Is Built, Not Born",
    description: "The best traders aren't born—they're built. RAimond accelerates that process with intelligent guardrails.",
    color: "#4a90e2"
  },
  {
    icon: Target,
    title: "Edge Comes From Execution, Not Just Analysis",
    description: "Having a plan means nothing if emotions override it. RAimond protects your edge when it matters most.",
    color: "#b794f6"
  },
  {
    icon: TrendingUp,
    title: "Real-Time Context Changes Everything",
    description: "Static indicators show what has happened. RAImond shows what's happening in the structure, in the present.",
    color: "#1FF0DA"
  }
];

export function WhyRAimondSection() {
  return (
    <section id="why" className="relative section-padding-md overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]" />
      <div className="absolute inset-0 neural-grid-subtle opacity-40" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <div className="px-4 py-2 rounded-full bg-[#1FF0DA]/10 border border-[#1FF0DA]/30">
              <span className="text-[#1FF0DA] text-sm">Why We Built This</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-6 font-['Space_Grotesk']">
            Why <span className="text-[#1FF0DA]">RAimond</span> Exists
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Built by traders who studied the gap between knowledge and execution
          </p>
        </motion.div>
        
        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              <div className="glass-card card-radius-sm p-8 h-full relative overflow-hidden hover:shadow-[0_0_30px_rgba(31,240,218,0.2)] transition-all duration-500">
                {/* Background Gradient */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at top left, ${reason.color}15 0%, transparent 70%)`
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex gap-4">
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${reason.color}20`,
                      border: `1px solid ${reason.color}30`
                    }}
                  >
                    <reason.icon size={24} style={{ color: reason.color }} />
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1">
                    <h3 
                      className="text-xl mb-3 font-['Space_Grotesk']"
                      style={{ color: reason.color }}
                    >
                      {reason.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 italic text-lg max-w-2xl mx-auto border-l-2 border-[#1FF0DA]/30 pl-6">
            "We're not trying to replace the trader. We're trying to amplify the disciplined, systematic version of you that already exists."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
