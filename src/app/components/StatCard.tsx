import { motion } from 'motion/react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  change?: number;
  changeType?: 'up' | 'down';
}

export function StatCard({ icon, label, value, change, changeType }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E6D3]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-[#F5E6D3] rounded-xl flex items-center justify-center text-2xl">
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {changeType === 'up' ? '↑' : '↓'} {change}%
          </span>
        )}
      </div>
      <p className="text-[#8B5E3C] text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#3E2723]">{value}</p>
    </motion.div>
  );
}
