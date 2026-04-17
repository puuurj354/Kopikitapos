import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { weeklySales, hourlyData, recentOrders } from "../data/menu";

const PERIODS = ["Harian", "Mingguan", "Bulanan"] as const;
type Period = (typeof PERIODS)[number];

const monthlyData = [
  { name: "Jan", sales: 38500000, orders: 1240 },
  { name: "Feb", sales: 42100000, orders: 1380 },
  { name: "Mar", sales: 39800000, orders: 1290 },
  { name: "Apr", sales: 45600000, orders: 1520 },
  { name: "Mei", sales: 51200000, orders: 1680 },
  { name: "Jun", sales: 48900000, orders: 1590 },
  { name: "Jul", sales: 53700000, orders: 1750 },
];

const topItems = [
  { name: "Caramel Macchiato", sold: 312, revenue: 13104000 },
  { name: "Latte", sold: 287, revenue: 10906000 },
  { name: "Cappuccino", sold: 256, revenue: 8960000 },
  { name: "Cold Brew", sold: 198, revenue: 6930000 },
  { name: "Cheese Cake", sold: 175, revenue: 7875000 },
];

export function ReportsView() {
  const [period, setPeriod] = useState<Period>("Mingguan");

  const chartData =
    period === "Harian"
      ? hourlyData.map((h) => ({
          name: h.hour,
          sales: h.sales,
          orders: Math.round(h.sales / 35000),
        }))
      : period === "Mingguan"
        ? weeklySales
        : monthlyData;

  const totalRevenue =
    period === "Harian"
      ? hourlyData.reduce((s, h) => s + h.sales, 0)
      : period === "Mingguan"
        ? weeklySales.reduce((s, w) => s + w.sales, 0)
        : monthlyData.reduce((s, m) => s + m.sales, 0);

  const totalOrders =
    period === "Harian"
      ? Math.round(totalRevenue / 35000)
      : period === "Mingguan"
        ? weeklySales.reduce((s, w) => s + w.orders, 0)
        : monthlyData.reduce((s, m) => s + m.orders, 0);

  const completedOrders = recentOrders.filter(
    (o) => o.status === "completed",
  ).length;
  const completionRate =
    recentOrders.length > 0
      ? Math.round((completedOrders / recentOrders.length) * 100)
      : 0;

  const tooltipStyle = {
    backgroundColor: "#3E2723",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#3E2723]">
            Laporan Keuangan
          </h1>
          <p className="text-[#8B5E3C] mt-1">
            Analisis pendapatan dan performa penjualan
          </p>
        </div>
        <div className="flex gap-1 bg-white border border-[#F5E6D3] rounded-xl p-1 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                period === p
                  ? "bg-[#6F4E37] text-white shadow-sm"
                  : "text-[#8B5E3C] hover:bg-[#F5E6D3]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: "💰",
            label: "Total Pendapatan",
            value: `Rp ${(totalRevenue / 1000000).toFixed(1)}jt`,
            change: "+12%",
            up: true,
          },
          {
            icon: "📦",
            label: "Total Pesanan",
            value: String(totalOrders),
            change: "+8%",
            up: true,
          },
          {
            icon: "✅",
            label: "Tingkat Selesai",
            value: `${completionRate}%`,
            change: "+3%",
            up: true,
          },
          {
            icon: "💵",
            label: "Rata-rata/Pesanan",
            value: `Rp ${Math.round(totalRevenue / Math.max(totalOrders, 1)).toLocaleString()}`,
            change: "+5%",
            up: true,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 border border-[#F5E6D3] shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-[#F5E6D3] rounded-xl flex items-center justify-center text-2xl">
                {card.icon}
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${card.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {card.change}
              </span>
            </div>
            <p className="text-xs text-[#8B5E3C]">{card.label}</p>
            <p className="text-xl font-bold text-[#3E2723] mt-0.5">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-[#F5E6D3] shadow-sm"
      >
        <h3 className="font-bold text-[#3E2723] mb-4">
          Grafik Pendapatan — {period}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            id={`reports-line-${period}`}
            key={`line-${period}`}
            data={chartData}
            accessibilityLayer={false}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
            <XAxis dataKey="name" stroke="#8B5E3C" tick={{ fontSize: 12 }} />
            <YAxis
              stroke="#8B5E3C"
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [
                `Rp ${value.toLocaleString()}`,
                "Pendapatan",
              ]}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#6F4E37"
              strokeWidth={2.5}
              dot={{ fill: "#6F4E37", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-[#F5E6D3] shadow-sm"
        >
          <h3 className="font-bold text-[#3E2723] mb-4">Jumlah Pesanan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              id={`reports-bar-${period}`}
              key={`bar-${period}`}
              data={chartData}
              accessibilityLayer={false}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
              <XAxis dataKey="name" stroke="#8B5E3C" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8B5E3C" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="orders" fill="#D4A574" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 border border-[#F5E6D3] shadow-sm"
        >
          <h3 className="font-bold text-[#3E2723] mb-4">Menu Terlaris</h3>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0
                      ? "bg-amber-400 text-white"
                      : i === 1
                        ? "bg-gray-300 text-gray-700"
                        : i === 2
                          ? "bg-amber-700 text-white"
                          : "bg-[#F5E6D3] text-[#8B5E3C]"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3E2723] truncate">
                    {item.name}
                  </p>
                  <div className="w-full bg-[#F5E6D3] rounded-full h-1.5 mt-1">
                    <div
                      className="bg-[#6F4E37] h-1.5 rounded-full"
                      style={{
                        width: `${(item.sold / topItems[0].sold) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-[#3E2723]">
                    {item.sold}x
                  </p>
                  <p className="text-xs text-[#A0826D]">
                    Rp {(item.revenue / 1000000).toFixed(1)}jt
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Export button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#D4A574] text-[#6F4E37] rounded-xl text-sm font-medium hover:bg-[#F5E6D3] transition-colors cursor-pointer shadow-sm">
          Ekspor Laporan
        </button>
      </div>
    </div>
  );
}
