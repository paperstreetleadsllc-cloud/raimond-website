import { motion } from "framer-motion";
import { Check, Zap, Shield, Gauge, TrendingUp, Cpu, type LucideIcon } from "lucide-react";

type PlanFeature = {
  icon: LucideIcon | null;
  text: string;
  highlight?: boolean;
};

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  popular: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    name: "Trader Plan",
    price: "149",
    period: "month",
    description: "Perfect for serious day traders and swing traders",
    features: [
      { icon: TrendingUp, text: "Real-time market data" },
      { icon: Cpu, text: "Basic AI insights" },
      { icon: Gauge, text: "Up to 50 trades/day" },
      { icon: null, text: "Standard execution speeds" },
      { icon: null, text: "Email support" },
      { icon: null, text: "Mobile app access" },
      { icon: Shield, text: "Basic governance rules" },
      { icon: null, text: "Community access" }
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Pro Plan",
    price: "349",
    period: "month",
    description: "For professional traders who demand the edge",
    features: [
      { icon: null, text: "Everything in Trader, plus:", highlight: true },
      { icon: Cpu, text: "Advanced AI insights with ML models" },
      { icon: Gauge, text: "Unlimited trades" },
      { icon: Zap, text: "Priority execution (<12ms)" },
      { icon: Shield, text: "RAimond Governance Engine" },
      { icon: TrendingUp, text: "Advanced order flow intelligence" },
      { icon: null, text: "Priority support" },
      { icon: null, text: "API access" },
      { icon: null, text: "Custom risk parameters" },
      { icon: null, text: "Advanced market structure overlay" },
      { icon: null, text: "Backtesting tools" },
      { icon: null, text: "Performance analytics" }
    ],
    cta: "Get Started",
    popular: true,
    badge: "Most Popular"
  }
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-transparent to-[#0a0e1a]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <div className="px-4 py-2 rounded-full bg-[#1FF0DA]/10 border border-[#1FF0DA]/30">
              <span className="text-[#1FF0DA] text-sm">Simple, Transparent Pricing</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-4 font-['Space_Grotesk']">Choose Your Edge</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            No hidden fees. No per-trade costs. Just straightforward pricing for professional traders.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group ${plan.popular ? "md:-mt-8" : ""}`}
            >
              {plan.popular && plan.badge ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1FF0DA] to-[#0a9e8f] px-4 py-1 text-xs text-[#0a0e1a] shadow-[0_0_20px_rgba(31,240,218,0.5)]">
                    <Zap size={14} className="text-[#0a0e1a]" />
                    <span>{plan.badge}</span>
                  </div>
                </div>
              ) : null}

              {plan.popular ? (
                <motion.div
                  className="absolute -inset-1 rounded-3xl blur-xl bg-gradient-to-r from-[#1FF0DA]/30 to-[#4a90e2]/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}

              <div
                className={`relative glass-card rounded-2xl p-8 h-full transition-all ${
                  plan.popular
                    ? "border-2 border-[#1FF0DA]/40 shadow-[0_0_40px_rgba(31,240,218,0.2)]"
                    : "hover:border-[#1FF0DA]/30"
                }`}
              >
                <div className="absolute inset-0 grid-pattern opacity-5 rounded-2xl" />
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl mb-2 font-['Space_Grotesk']">{plan.name}</h3>
                    <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-5xl text-white font-['Space_Grotesk']">${plan.price}</span>
                      <span className="ml-2 text-gray-500">/{plan.period}</span>
                    </div>
                    <button
                      type="button"
                      className={`w-full rounded-full px-7 py-3 text-base font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/60 ${
                        plan.popular
                          ? "bg-[var(--cyber-teal)] text-[var(--deep-navy)] shadow-[0_0_30px_rgba(31,240,218,0.4)] hover:bg-[var(--cyber-teal)]/90 hover:shadow-[0_0_40px_rgba(31,240,218,0.6)]"
                          : "bg-[#1a2332] text-white hover:bg-[#1a2332]/80"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#1FF0DA]/20">
                          {feature.icon ? (
                            <feature.icon size={12} className="text-[#1FF0DA]" />
                          ) : (
                            <Check size={14} className="text-[#1FF0DA]" />
                          )}
                        </div>
                        <span className={`text-sm ${feature.highlight ? "text-[#1FF0DA]" : "text-gray-300"}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">All plans include 14-day free trial. No credit card required.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            {[
              "Cancel anytime",
              "No setup fees",
              "24/7 support"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check size={16} className="text-[#1FF0DA]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto glass-card rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl mb-3 font-['Space_Grotesk']">Need Enterprise Solutions?</h3>
          <p className="text-gray-400 mb-6">
            Custom deployment, dedicated infrastructure, and white-label options for prop firms and institutions.
          </p>
          <button
            type="button"
            className="rounded-full border border-[#1FF0DA]/30 px-8 py-3 text-base font-semibold text-white transition hover:bg-[#1FF0DA]/10 hover:border-[#1FF0DA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1FF0DA]/40"
          >
            Contact Sales
          </button>
        </motion.div>
      </div>
    </section>
  );
}
