import React from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { usePOS } from '../context/POSContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { weeklySales, categoryData, recentOrders } from '../data/menu';

export function DashboardView() {
  // trigger reload
  const { setCurrentView } = usePOS();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#3E2723]">Dashboard</h1>
            <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold">👑 Admin</span>
          </div>
          <p className="text-[#8B5E3C]">Selamat datang, {user?.name ?? 'Admin'}! Berikut ringkasan hari ini.</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('reports')}
            className="bg-white border-2 border-[#D4A574] text-[#6F4E37] px-4 py-2.5 rounded-xl font-medium hover:bg-[#F5E6D3] transition-colors flex items-center gap-2 cursor-pointer text-sm"
          >
            <span>📈</span> Laporan
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('pos')}
            className="bg-[#6F4E37] text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:bg-[#5D4037] transition-colors flex items-center gap-2 cursor-pointer text-sm"
          >
            <span>🛒</span> Buat Pesanan
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Pendapatan Hari Ini" value="Rp 4.850.000" change={12} changeType="up" />
        <StatCard icon="📦" label="Total Pesanan" value="156" change={8} changeType="up" />
        <StatCard icon="👥" label="Pelanggan" value="89" change={3} changeType="up" />
        <StatCard icon="⭐" label="Rating" value="4.8" change={0} changeType="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#F5E6D3]"
        >
          <h3 className="text-lg font-bold text-[#3E2723] mb-4">Penjualan Mingguan</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart id="dashboard-bar" data={weeklySales} accessibilityLayer={false}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
              <XAxis dataKey="name" stroke="#8B5E3C" />
              <YAxis stroke="#8B5E3C" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#3E2723', border: 'none', borderRadius: '12px', color: '#fff' }}
                formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Penjualan']}
              />
              <Bar dataKey="sales" fill="#6F4E37" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E6D3]"
        >
          <h3 className="text-lg font-bold text-[#3E2723] mb-4">Kategori Terlaris</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart id="dashboard-pie" accessibilityLayer={false}>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-[#8B5E3C]">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E6D3]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#3E2723]">Pesanan Terbaru</h3>
          <button onClick={() => setCurrentView('orders')} className="text-[#6F4E37] text-sm font-medium hover:underline">
            Lihat Semua →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5E6D3]">
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">ID</th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">Meja</th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">Items</th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">Total</th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-[#FAFAFA] hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-3 px-4 text-[#3E2723] font-medium">{order.id}</td>
                  <td className="py-3 px-4 text-[#6F4E37]">{order.table}</td>
                  <td className="py-3 px-4 text-[#6F4E37]">{order.items}</td>
                  <td className="py-3 px-4 text-[#3E2723] font-medium">Rp {order.total.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'completed' ? 'Selesai' :
                       order.status === 'preparing' ? 'Diproses' : 'Menunggu'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#8B5E3C]">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}