import { motion } from 'framer-motion';
import { Smartphone, Laptop, Gamepad2, MoreHorizontal } from 'lucide-react';

export default function DeviceGrid() {
  const devices = [
    {
      brand: 'Apple',
      items: ['iPhone', 'MacBook', 'iPad'],
      icon: Smartphone,
      colSpan: 'md:col-span-2',
    },
    {
      brand: 'Samsung',
      items: ['S Series', 'Z Series'],
      icon: Smartphone,
      colSpan: 'md:col-span-1',
    },
    {
      brand: 'Google',
      items: ['Pixel'],
      icon: Smartphone,
      colSpan: 'md:col-span-1',
    },
    {
      brand: 'Sony',
      items: ['PS5'],
      icon: Gamepad2,
      colSpan: 'md:col-span-1',
    },
    {
      brand: 'Microsoft',
      items: ['Xbox'],
      icon: Gamepad2,
      colSpan: 'md:col-span-1',
    },
    {
      brand: 'Gaming Laptops',
      items: ['High-end Gaming Laptops'],
      icon: Laptop,
      colSpan: 'md:col-span-1',
    },
    {
      brand: 'And More',
      items: ['Tablets', 'Smartwatches', 'Other Devices'],
      icon: MoreHorizontal,
      colSpan: 'md:col-span-2',
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
            Device Eligibility
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We accept a wide range of high-value electronics. If you don't see your device, ask us!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map((device, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`${device.colSpan} glass-card p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <device.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{device.brand}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {device.items.map((item, itemIndex) => (
                  <span
                    key={itemIndex}
                    className="px-3 py-1 text-sm bg-white/5 rounded-full text-gray-300 border border-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
