import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, LayoutDashboard } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '2348169738828';
  const message = 'Hi! I want to get an estimate for my device.';
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary flex items-center gap-2"
    >
      <MessageCircle className="w-5 h-5" />
      Get an Estimate
    </a>
  );
};

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-navy-900 font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-semibold text-white">Locket</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
            <WhatsAppButton />
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/admin"
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/2348169738828?text=Hi!%20I%20want%20to%20get%20an%20estimate%20for%20my%20device."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
