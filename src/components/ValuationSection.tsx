import { motion } from 'framer-motion';
import { Calculator, Percent, Clock, CheckCircle } from 'lucide-react';

export default function ValuationSection() {
  const items = [
    {
      icon: Calculator,
      title: '50% of Market Value',
      description: 'Loans are based on 50% of the current used market value of your device.',
    },
    {
      icon: Percent,
      title: '20% Monthly Interest',
      description: 'A flat 20% monthly interest rate with no hidden fees. What you see is what you get.',
    },
    {
      icon: Clock,
      title: '10-Minute Inspection',
      description: 'Final offers are subject to a quick 10-minute physical inspection to verify condition.',
    },
    {
      icon: CheckCircle,
      title: 'No Surprises',
      description: 'We explain everything upfront. No last-minute changes to your offer.',
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
            The Valuation Logic
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We believe in transparent, fair pricing. Here's how we determine your loan value.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
