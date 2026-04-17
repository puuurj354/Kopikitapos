import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Order, OrderFilter } from "../types/pos";

const filterTabs: { id: OrderFilter; label: string; emoji: string }[] = [
  { id: "all", label: "Semua", emoji: "📋" },
  { id: "pending", label: "Menunggu", emoji: "⏳" },
  { id: "preparing", label: "Diproses", emoji: "⟳" },
  { id: "completed", label: "Selesai", emoji: "✓" },
];

export function OrdersView() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<OrderFilter>("all");

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(quantity)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!data) return [];

      return data.map((o: any) => {
        const itemsCount =
          o.order_items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          ) || 0;
        return {
          id: o.id,
          items: itemsCount,
          total: o.total,
          status: o.status as Order["status"],
          time: new Date(o.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          table: o.table_number || "-",
        };
      });
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredOrders = useMemo(
    () =>
      filter === "all" ? orders : orders.filter((o) => o.status === filter),
    [filter, orders],
  );

  const counts = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      completed: orders.filter((o) => o.status === "completed").length,
    }),
    [orders],
  );

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: Order["status"];
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const updateStatus = (id: string, newStatus: Order["status"]) => {
    updateStatusMutation.mutate({ id, newStatus });
  };

  const cancelOrder = (id: string) => {
    cancelOrderMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#3E2723]">
            {isAdmin ? "Manajemen Pesanan" : "Antrian Pesanan"}
          </h1>
          <p className="text-[#8B5E3C] mt-1">
            {isAdmin
              ? "Kelola dan pantau semua pesanan hari ini"
              : "Update status pesanan yang sedang berjalan"}
          </p>
        </div>

        {/* Role badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
            isAdmin
              ? "bg-amber-100 text-amber-800"
              : "bg-[#F5E6D3] text-[#6F4E37]"
          }`}
        >
          <span>{isAdmin ? "👑" : "👤"}</span>
          {isAdmin ? "Akses Penuh" : "Akses Terbatas"}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {filterTabs.map((tab) => (
          <div
            key={tab.id}
            className="bg-white rounded-xl p-4 border border-[#F5E6D3] shadow-sm"
          >
            <p className="text-xs text-[#8B5E3C]">{tab.label}</p>
            <p className="text-2xl font-bold text-[#3E2723] mt-1">
              {counts[tab.id]}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filter === tab.id
                ? "bg-[#6F4E37] text-white"
                : "bg-white text-[#8B5E3C] border border-[#F5E6D3] hover:bg-[#F5E6D3]"
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${filter === tab.id ? "bg-white/20" : "bg-[#F5E6D3]"}`}
            >
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-[#F5E6D3] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5E6D3]">
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  ID Pesanan
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Meja
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Jumlah Item
                </th>
                {isAdmin && (
                  <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                    Total
                  </th>
                )}
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Waktu
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 7 : 6}
                      className="py-12 text-center text-[#A0826D]"
                    >
                      <span className="text-4xl block mb-2">📋</span>
                      Tidak ada pesanan
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-[#FAFAFA] hover:bg-[#FAFAFA] transition-colors"
                    >
                      <td className="py-4 px-6 text-[#3E2723] font-medium">
                        #{order.id.split("-")[0]}
                      </td>
                      <td className="py-4 px-6 text-[#6F4E37]">
                        <span className="bg-[#F5E6D3] px-2 py-1 rounded-lg text-sm font-medium">
                          Meja {order.table}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#6F4E37]">
                        {order.items} item
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-[#3E2723] font-semibold">
                          Rp {order.total.toLocaleString()}
                        </td>
                      )}
                      <td className="py-4 px-6">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-6 text-[#8B5E3C]">{order.time}</td>
                      <td className="py-4 px-6">
                        <ActionButtons
                          order={order}
                          isAdmin={isAdmin}
                          onUpdateStatus={updateStatus}
                          onCancel={cancelOrder}
                        />
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Barista info banner */}
      {!isAdmin && (
        <div className="bg-[#F5E6D3] border border-[#D4A574] rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="text-sm font-medium text-[#3E2723]">Mode Barista</p>
            <p className="text-xs text-[#8B5E3C] mt-1">
              Kamu dapat mengupdate status pesanan. Untuk membatalkan pesanan,
              hubungi Admin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const styles = {
    completed: "bg-green-100 text-green-700",
    preparing: "bg-yellow-100 text-yellow-700",
    pending: "bg-red-100 text-red-700",
  };
  const labels = {
    completed: "✓ Selesai",
    preparing: "⟳ Diproses",
    pending: "⏳ Menunggu",
  };
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function ActionButtons({
  order,
  isAdmin,
  onUpdateStatus,
  onCancel,
}: {
  order: Order;
  isAdmin: boolean;
  onUpdateStatus: (id: string, status: Order["status"]) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {/* Barista & Admin: process pending */}
      {order.status === "pending" && (
        <button
          onClick={() => onUpdateStatus(order.id, "preparing")}
          className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors cursor-pointer"
        >
          Proses
        </button>
      )}
      {/* Barista & Admin: complete preparing */}
      {order.status === "preparing" && (
        <button
          onClick={() => onUpdateStatus(order.id, "completed")}
          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors cursor-pointer"
        >
          Selesai
        </button>
      )}
      {/* Admin only: cancel order */}
      {isAdmin && order.status !== "completed" && (
        <button
          onClick={() => onCancel(order.id)}
          className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors cursor-pointer"
        >
          Batalkan
        </button>
      )}
      {/* Admin only: detail */}
      {isAdmin && (
        <button className="px-3 py-1.5 bg-[#F5E6D3] text-[#6F4E37] rounded-lg text-xs font-medium hover:bg-[#E8D5C0] transition-colors cursor-pointer">
          Detail
        </button>
      )}
    </div>
  );
}
