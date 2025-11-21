import { motion } from "framer-motion";
import ImageWithFallback from "./figma/ImageWithFallback";

export function PhilosophySection() {
  const philosophyPoints = [
    {
      title: "Edge is No Longer Optional",
      description: "In modern markets, information asymmetry is the only sustainable advantage. RAimond brings a systematic intelligence layer on top of your process, turning market noise into actionable insight.",
      image: "https://images.unsplash.com/photo-1750969185331-e03829f72c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXVyYWwlMjBuZXR3b3JrJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzYyODg5NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      title: "Discipline Over Discretion",
      description: "The best traders aren't the most talented—they're the most disciplined. Our governance engine removes the emotional override that destroys P&L, automating your best intentions into consistent execution.",
      image: "https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYyOTU1MjUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      title: "Infrastructure as Advantage",
      description: "Retail infrastructure held you back. RAimond gives you institutional-grade execution, data pipelines, and analytics—all wrapped in a beautifully simple interface designed for serious traders.",
      image: "https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBuZXR3b3JrfGVufDF8fHx8MTc2Mjk0OTIyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  return (
    <section id="philosophy" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1FF0DA]/5 to-transparent" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <div className="px-4 py-2 rounded-full bg-[#1FF0DA]/10 border border-[#1FF0DA]/30">
              <span className="text-[#1FF0DA] text-sm">Product Philosophy</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-['Space_Grotesk']">
            Built on Core Principles
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Every decision in RAimond's design reflects our belief in systematic advantage, disciplined execution, and institutional-grade infrastructure.
          </p>
        </motion.div>

        <div className="space-y-24">
          {philosophyPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={`${index % 2 === 1 ? "lg:order-2" : ""} space-y-6`}>
                <div className="inline-flex items-center space-x-3">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-[#1FF0DA] to-transparent" />
                  <span className="text-sm text-[#1FF0DA]">0{index + 1}</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white font-['Space_Grotesk']">
                  {point.title}
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  {point.description}
                </p>
              </div>

              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#1FF0DA]/20 to-[#4a90e2]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative glass-card rounded-2xl p-2 overflow-hidden">
                    <ImageWithFallback
                      src={point.image}
                      alt={point.title}
                      className="w-full h-80 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-12 text-center border-l-4 border-[#1FF0DA]">
            <div className="text-2xl sm:text-3xl text-white leading-relaxed mb-6 font-['Space_Grotesk']">
              "The market rewards preparation, punishes emotion, and respects discipline. RAimond is built to amplify all three."
            </div>
            <div className="text-gray-400">
              — RAimond Engineering Team
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
