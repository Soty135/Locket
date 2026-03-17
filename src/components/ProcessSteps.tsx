import { motion } from 'framer-motion';
import { MessageSquare, Search, Banknote } from 'lucide-react';

export default function ProcessSteps() {
  const steps = [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Request',
      description: 'Send device details and photos via WhatsApp for a preliminary quote. We respond within minutes.',
    },
    {
      number: '02',
      icon: Search,
      title: 'Verify',
      description: 'Meet for a quick technical inspection and sign a simple collateral agreement. Takes just 10 minutes.',
    },
    {
      number: '03',
      icon: Banknote,
      title: 'Fund',
      description: 'Receive an instant bank transfer. Your device is sealed and stored safely until you repay.',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            The 3-Step Process
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Getting cash for your device is simple. From request to funds in under 15 minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="glass-card p-8 h-full hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-5xl font-bold text-amber-500/30">{step.number}</span>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 rounded-full bg-navy-800 border border-white/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
