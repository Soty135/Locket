import { motion } from 'framer-motion';
import { MessageCircle, Shield, Clock } from 'lucide-react';

export default function Footer() {
  const phoneNumber = '2348169738828';
  const message = 'Hi! I want to get an estimate for my device.';
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <footer className="py-12 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-navy-900 font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-semibold text-white">Locket</span>
          </div>

          <p className="text-gray-400 mb-8">
            Your tech. Your credit. Your way.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-5 h-5 text-amber-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Fast</span>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Locket. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
