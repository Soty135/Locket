import { motion } from 'framer-motion';
import { MapPin, Lock, Warehouse, EyeOff } from 'lucide-react';

export default function SecureHandover() {
  const protocols = [
    {
      icon: MapPin,
      title: 'Public Meeting Points',
      description: 'All transactions occur in verified, CCTV-monitored public locations for your safety.',
    },
    {
      icon: Lock,
      title: 'Tamper-Evident Sealing',
      description: 'Devices are sealed in security bags in front of you and signed across the seal.',
    },
    {
      icon: Warehouse,
      title: 'Safe Storage',
      description: 'Your assets are stored in a monitored, climate-controlled vault until repayment.',
    },
    {
      icon: EyeOff,
      title: 'Data Privacy',
      description: 'We never access your data. We only verify that the device is not "Cloud Locked."',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            The Secure Handover Protocol
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your device's security is our top priority. Every step is designed to protect your asset.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {protocols.map((protocol, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <protocol.icon className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{protocol.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{protocol.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
