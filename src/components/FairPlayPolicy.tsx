import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, UserCheck } from 'lucide-react';

export default function FairPlayPolicy() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 md:p-12"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl font-bold text-white">
              The "Fair Play" Default Policy
            </h2>
          </div>

          <div className="space-y-6 text-center">
            <p className="text-lg text-gray-300 leading-relaxed">
              We believe in complete transparency. Here's what happens if you can't repay on time:
            </p>

            <div className="grid sm:grid-cols-3 gap-6 py-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-center"
              >
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">No Debt Collectors</h3>
                <p className="text-gray-400 text-sm">
                  If the loan isn't repaid by the due date, the device is sold to recover costs.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-center"
              >
                <UserCheck className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">No Credit Impact</h3>
                <p className="text-gray-400 text-sm">
                  Your credit score remains unaffected. We don't report to credit bureaus.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-center"
              >
                <ShieldCheck className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">No Hidden Fees</h3>
                <p className="text-gray-400 text-sm">
                  Only what we agreed upon. No surprise charges or penalties.
                </p>
              </motion.div>
            </div>

            <p className="text-gray-400 text-sm pt-4 border-t border-white/10">
              We treat every customer fairly. Our goal is to help you, not to take your device.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
