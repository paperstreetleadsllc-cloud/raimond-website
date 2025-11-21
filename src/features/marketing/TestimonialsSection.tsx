import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Marcus Chen",
      role: "Futures Trader",
      company: "Proprietary Trading",
      content: "RAimond has fundamentally changed how I approach order flow. The AI insights are uncannily accurate, and the discipline engine stopped me from blowing up my account twice this month alone.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Sarah Rodriguez",
      role: "Day Trader",
      company: "Independent",
      content: "I've tried every platform out there. RAimond is the first one that actually feels like it was built by traders who understand microstructure. The execution speed is phenomenal.",
      rating: 5,
      avatar: "SR",
    },
    {
      name: "David Park",
      role: "Systematic Trader",
      company: "Quantitative Research",
      content: "The governance guardrails are a game-changer. I can finally backtest a strategy and trust that my live execution will match it. No more emotional overrides destroying my edge.",
      rating: 5,
      avatar: "DP",
    },
    {
      name: "Emma Larsson",
      role: "Options Trader",
      company: "Volatility Arbitrage",
      content: "RAimond's market structure overlay saved me from a massive loss during last week's volatility spike. The AI flagged unusual flow patterns 15 minutes before the move.",
      rating: 5,
      avatar: "EL",
    },
    {
      name: "James Williams",
      role: "Swing Trader",
      company: "Asset Management",
      content: "Clean interface, powerful features, and the best customer support I've experienced in fintech. RAimond is what modern trading infrastructure should look like.",
      rating: 5,
      avatar: "JW",
    },
    {
      name: "Lisa Thompson",
      role: "Scalper",
      company: "High-Frequency Trading",
      content: "Execution finally feels consistent instead of reactive. My fill quality has improved because RAImond keeps the playbook accountable in real time.",
      rating: 5,
      avatar: "LT",
    },
  ];

  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <div className="px-4 py-2 rounded-full bg-[#1FF0DA]/10 border border-[#1FF0DA]/30">
              <span className="text-[#1FF0DA] text-sm">Trusted by Traders</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-['Space_Grotesk']">
            What Traders Are Saying
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join hundreds of professional traders who've made RAimond their competitive advantage.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative glass-card rounded-2xl p-6 h-full hover:border-[#1FF0DA]/30 transition-all">
                {/* Rating Stars */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-[#1FF0DA] text-[#1FF0DA]"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-300 leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1FF0DA] to-[#0a9e8f] flex items-center justify-center text-[#0a0e1a] flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-['Space_Grotesk']">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Hover Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1FF0DA] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
