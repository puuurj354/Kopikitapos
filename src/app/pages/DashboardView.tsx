import React, { useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { usePOS } from "../context/POSContext";
import { useAuth } from "../context/AuthContext";
import { StatCard } from "../components/StatCard";

const COLORS = ["#6F4E37", "#8B5E3C", "#A0826D", "#D4A574", "#F5E6D3"];

export function DashboardView() {
  const { setCurrentView } = usePOS();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Listen to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel("dashboard_orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard_orders"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch recent orders for metrics and charts
  const { data: rawOrders = [] } = useQuery({
    queryKey: ["dashboard_orders"],
    queryFn: async () => {
      // Fetch orders from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("orders")
        .select(
          "*, order_items(quantity, price_at_time, products(categories(name)))",
        )
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const {
    todayRevenue,
    todayOrdersCount,
    weeklySales,
    recentOrdersList,
    categoryData,
  } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    let todayRev = 0;
    let todayCount = 0;

    const categoryCounts: Record<string, number> = {};
    let totalItems = 0;

    // Group sales by day
    const salesByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
      const dateStr = d.toISOString().split("T")[0];
      salesByDay[dateStr] = {
        name: dayName,
        sales: 0,
        sortKey: dateStr,
      } as any;
    }

    const recentList = [];

    for (const order of rawOrders) {
      const orderDateStr = new Date(order.created_at)
        .toISOString()
        .split("T")[0];

      // Today stats
      if (orderDateStr === todayStr) {
        todayRev += order.total;
        todayCount++;
      }

      // Weekly stats
      if (salesByDay[orderDateStr]) {
        (salesByDay[orderDateStr] as any).sales += order.total;
      }

      // Recent list (first 5)
      if (recentList.length < 5) {
        const itemsCount =
          order.order_items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          ) || 0;
        recentList.push({
          id: order.id.split("-")[0],
          table: order.table_number || "-",
          items: itemsCount,
          total: order.total,
          status: order.status,
          time: new Date(order.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }

      if (order.order_items) {
        for (const item of order.order_items) {
          const qty = item.quantity || 0;
          totalItems += qty;
          const catName = item.products?.categories?.name || "Lainnya";
          categoryCounts[catName] = (categoryCounts[catName] || 0) + qty;
        }
      }
    }

    const weekly = Object.values(salesByDay).sort((a: any, b: any) =>
      a.sortKey.localeCompare(b.sortKey),
    );

    const realCategories = Object.entries(categoryCounts)
      .map(([name, count], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
        color: COLORS[index % COLORS.length],
      }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);

    // Ensure we have something to display if empty
    if (realCategories.length === 0) {
      realCategories.push({
        name: "Belum ada data",
        value: 100,
        color: "#D4A574",
      });
    }

    return {
      todayRevenue: todayRev,
      todayOrdersCount: todayCount,
      weeklySales: weekly,
      recentOrdersList: recentList,
      categoryData: realCategories,
    };
  }, [rawOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#3E2723]">
              Dashboard
            </h1>
            <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              {user?.role === "admin" ? "👑 Admin" : "👤 Barista"}
            </span>
          </div>
          <p className="text-[#8B5E3C]">
            Selamat datang, {user?.name ?? "Admin"}! Berikut ringkasan hari ini.
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView("reports")}
            className="bg-white border-2 border-[#D4A574] text-[#6F4E37] px-4 py-2.5 rounded-xl font-medium hover:bg-[#F5E6D3] transition-colors flex items-center gap-2 cursor-pointer text-sm"
          >
            <span>📈</span> Laporan
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView("pos")}
            className="bg-[#6F4E37] text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:bg-[#5D4037] transition-colors flex items-center gap-2 cursor-pointer text-sm"
          >
            <span>🛒</span> Buat Pesanan
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="💰"
          label="Pendapatan Hari Ini"
          value={`Rp ${todayRevenue.toLocaleString()}`}
          change={0}
          changeType="up"
        />
        <StatCard
          icon="📦"
          label="Total Pesanan"
          value={todayOrdersCount.toString()}
          change={0}
          changeType="up"
        />
        <StatCard
          icon="👥"
          label="Pelanggan"
          value={todayOrdersCount.toString()} // Using orders count as proxy for now
          change={0}
          changeType="up"
        />
        <StatCard
          icon="⭐"
          label="Rating"
          value="4.8"
          change={0}
          changeType="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#F5E6D3]"
        >
          <h3 className="text-lg font-bold text-[#3E2723] mb-4">
            Penjualan 7 Hari Terakhir
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              id="dashboard-bar"
              data={weeklySales}
              accessibilityLayer={false}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
              <XAxis dataKey="name" stroke="#8B5E3C" />
              <YAxis
                stroke="#8B5E3C"
                tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#3E2723",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value: number) => [
                  `Rp ${value.toLocaleString()}`,
                  "Penjualan",
                ]}
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
          <h3 className="text-lg font-bold text-[#3E2723] mb-4">
            Kategori Terlaris
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart id="dashboard-pie" accessibilityLayer={false}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
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
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[#8B5E3C]">
                  {item.name} ({item.value}%)
                </span>
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
          <button
            onClick={() => setCurrentView("orders")}
            className="text-[#6F4E37] text-sm font-medium hover:underline cursor-pointer"
          >
            Lihat Semua →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5E6D3]">
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">
                  Meja
                </th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">
                  Items
                </th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">
                  Total
                </th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-[#8B5E3C] font-medium text-sm">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrdersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#8B5E3C]">
                    Belum ada pesanan
                  </td>
                </tr>
              ) : (
                recentOrdersList.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#FAFAFA] hover:bg-[#FAFAFA] transition-colors"
                  >
                    <td className="py-3 px-4 text-[#3E2723] font-medium">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4 text-[#6F4E37]">
                      Meja {order.table}
                    </td>
                    <td className="py-3 px-4 text-[#6F4E37]">{order.items}</td>
                    <td className="py-3 px-4 text-[#3E2723] font-medium">
                      Rp {order.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "preparing"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.status === "completed"
                          ? "Selesai"
                          : order.status === "preparing"
                            ? "Diproses"
                            : "Menunggu"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8B5E3C]">{order.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
