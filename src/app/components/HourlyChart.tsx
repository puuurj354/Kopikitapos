import React from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { hourlyData } from '../data/menu';

export function HourlyChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E6D3]"
    >
      <h3 className="text-lg font-bold text-[#3E2723] mb-4">Penjualan per Jam</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart id="hourly-chart" data={hourlyData} accessibilityLayer={false}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
          <XAxis dataKey="hour" stroke="#8B5E3C" />
          <YAxis stroke="#8B5E3C" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#3E2723', border: 'none', borderRadius: '12px', color: '#fff' }}
            formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Penjualan']}
          />
          <Line type="monotone" dataKey="sales" stroke="#6F4E37" strokeWidth={3} dot={{ fill: '#6F4E37', r: 5 }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}