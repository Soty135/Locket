import { motion } from 'framer-motion';
import { MessageCircle, Shield, Clock, CreditCard } from 'lucide-react';

export default function Hero() {
  const phoneNumber = '2348169738828';
  const message = 'Hi! I want to get an estimate for my device.';
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const features = [
    { icon: Clock, text: '15-minute process' },
    { icon: Shield, text: 'No credit checks' },
    { icon: CreditCard, text: '50% of device value' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm text-gray-300">Secure. Transparent. Fast.</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Instant Liquidity.{' '}
          <span className="gradient-text">Your Tech is Your Credit.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
        >
          Secure a short-term loan in 15 minutes using your smartphone, laptop, or console as collateral. 
          No paperwork, no credit checks—just fair value.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg px-8 py-4 flex items-center gap-3"
          >
            <MessageCircle className="w-6 h-6" />
            Get an Estimate via WhatsApp
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400">
              <feature.icon className="w-5 h-5 text-amber-500" />
              <span>{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </div>
    </section>
  );
}
