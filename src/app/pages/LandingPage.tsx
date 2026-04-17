import React from 'react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3E2723] via-[#5D4037] to-[#4E342E] text-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6F4E37] rounded-xl flex items-center justify-center text-xl">☕</div>
            <span className="text-xl font-bold">KopiKita</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-white text-[#3E2723] rounded-xl font-medium hover:bg-[#F5E6D3] transition-colors"
          >
            Masuk
          </motion.button>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Sistem POS Modern untuk <span className="text-[#D4A574]">Kedai Kopi</span> Anda
            </h1>
            <p className="text-[#D4A574] text-lg mb-8 max-w-lg">
              Kelola pesanan, pantau penjualan, dan tingkatkan efisiensi bisnis kopi Anda dengan satu platform yang mudah digunakan.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 py-4 bg-[#6F4E37] text-white rounded-xl font-medium shadow-lg hover:bg-[#8B6914] transition-colors"
              >
                Mulai Sekarang →
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {[
              { icon: '📊', title: 'Dashboard', desc: 'Analitik real-time' },
              { icon: '🛒', title: 'POS Cepat', desc: 'Proses pesanan instan' },
              { icon: '📋', title: 'Pesanan', desc: 'Kelola semua order' },
              { icon: '💳', title: 'Multi Payment', desc: 'Tunai, Debit, QRIS' },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3 className="font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-[#D4A574]">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#2E1B12] py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: 'Kedai' },
            { value: '1M+', label: 'Transaksi' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9', label: 'Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-[#D4A574]">{stat.value}</p>
              <p className="text-sm text-[#A0826D] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
