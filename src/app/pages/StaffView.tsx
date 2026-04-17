import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { StaffMember, UserRole } from "../types/pos";

const SHIFTS = [
  "Shift Pagi (07:00–15:00)",
  "Shift Siang (13:00–21:00)",
  "Shift Malam (17:00–23:00)",
  "Full Time",
];

export function StaffView() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "barista" as UserRole,
    shift: SHIFTS[0],
  });
  const [formError, setFormError] = useState("");

  const { data: staff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, username, role, shift")
        .order("name");
      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: ordersData } = await supabase
        .from("orders")
        .select("user_id")
        .gte("created_at", today.toISOString());

      const orderCounts: Record<string, number> = {};
      if (ordersData) {
        ordersData.forEach((o) => {
          if (o.user_id) {
            orderCounts[o.user_id] = (orderCounts[o.user_id] || 0) + 1;
          }
        });
      }

      return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        role: u.role as UserRole,
        shift: u.shift || "-",
        ordersToday: orderCounts[u.id] || 0,
        status: "active" as const, // (Mock status)
      }));
    },
  });

  const activeStaff = staff.filter((s) => s.status === "active");
  const baristas = staff.filter((s) => s.role === "barista");
  const admins = staff.filter((s) => s.role === "admin");
  const totalOrdersToday = staff.reduce((sum, s) => sum + s.ordersToday, 0);

  const addStaffMutation = useMutation({
    mutationFn: async (newStaff: typeof form) => {
      const { error } = await supabase.from("users").insert({
        name: newStaff.name.trim(),
        username: newStaff.username.trim().toLowerCase(),
        password: newStaff.password,
        role: newStaff.role,
        shift: newStaff.shift,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setForm({
        name: "",
        username: "",
        password: "",
        role: "barista",
        shift: SHIFTS[0],
      });
      setShowForm(false);
      setFormError("");
    },
    onError: (err: any) => {
      setFormError(err.message || "Gagal menambahkan staff");
    },
  });

  const removeStaffMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });

  const removeStaff = (id: string | number) => {
    if (confirm("Yakin ingin menghapus staff ini?")) {
      removeStaffMutation.mutate(id);
    }
  };

  const handleAddStaff = () => {
    if (!form.name.trim()) {
      setFormError("Nama harus diisi");
      return;
    }
    if (!form.username.trim()) {
      setFormError("Username harus diisi");
      return;
    }
    if (!form.password.trim()) {
      setFormError("Password harus diisi");
      return;
    }
    addStaffMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#3E2723]">
            Manajemen Staff
          </h1>
          <p className="text-[#8B5E3C] mt-1">
            {staff.length} total · {activeStaff.length} aktif hari ini
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowForm(true);
            setFormError("");
          }}
          className="flex items-center gap-2 bg-[#6F4E37] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#5D4037] transition-colors shadow-md cursor-pointer"
        >
          <span>＋</span> Tambah Staff
        </motion.button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "👥", label: "Total Staff", value: staff.length },
          { icon: "🟢", label: "Aktif Hari Ini", value: activeStaff.length },
          { icon: "👤", label: "Barista", value: baristas.length },
          { icon: "👑", label: "Admin", value: admins.length },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-5 border border-[#F5E6D3] shadow-sm"
          >
            <div className="w-10 h-10 bg-[#F5E6D3] rounded-xl flex items-center justify-center text-xl mb-3">
              {card.icon}
            </div>
            <p className="text-xs text-[#8B5E3C]">{card.label}</p>
            <p className="text-2xl font-bold text-[#3E2723]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-[#F5E6D3] shadow-sm p-6"
          >
            <h3 className="font-bold text-[#3E2723] mb-4">
              ➕ Tambah Anggota Staff
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Nama Lengkap
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Budi Kopi"
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Username (Login)
                </label>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, username: e.target.value }))
                  }
                  placeholder="budikopi"
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="******"
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, role: e.target.value as UserRole }))
                  }
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors cursor-pointer"
                >
                  <option value="barista">Barista</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Shift
                </label>
                <select
                  value={form.shift}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, shift: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors cursor-pointer"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {formError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddStaff}
                disabled={addStaffMutation.isPending}
                className="px-5 py-2.5 bg-[#6F4E37] text-white rounded-xl text-sm font-medium hover:bg-[#5D4037] transition-colors cursor-pointer disabled:opacity-50"
              >
                {addStaffMutation.isPending ? "Menambahkan..." : "Tambahkan"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                className="px-5 py-2.5 bg-[#F5E6D3] text-[#6F4E37] rounded-xl text-sm font-medium hover:bg-[#E8D5C0] transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hierarchy visual */}
      <div className="bg-white rounded-2xl border border-[#F5E6D3] shadow-sm p-6">
        <h3 className="font-bold text-[#3E2723] mb-4">Struktur Organisasi</h3>
        <div className="flex flex-col items-center gap-3">
          {/* Admin level */}
          <div className="flex gap-3 flex-wrap justify-center">
            {admins.map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-amber-100 border-2 border-amber-400 rounded-full flex items-center justify-center text-2xl">
                  👑
                </div>
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Admin
                </span>
                <span className="text-xs text-[#3E2723]">{a.name}</span>
              </div>
            ))}
          </div>
          {/* Arrow */}
          <div className="flex flex-col items-center text-[#D4A574]">
            <div className="w-0.5 h-5 bg-[#D4A574]" />
            <span className="text-lg">▼</span>
            <div className="w-0.5 h-2 bg-[#D4A574]" />
          </div>
          {/* Barista level */}
          <div className="flex gap-4 flex-wrap justify-center">
            {baristas.map((b) => (
              <div key={b.id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
                    b.status === "active"
                      ? "bg-[#F5E6D3] border-[#6F4E37]"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  👤
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    b.status === "active"
                      ? "text-[#6F4E37] bg-[#F5E6D3]"
                      : "text-gray-500 bg-gray-100"
                  }`}
                >
                  Barista
                </span>
                <span className="text-xs text-[#3E2723]">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff table */}
      <div className="bg-white rounded-2xl border border-[#F5E6D3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5E6D3]">
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Nama
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Role
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Shift
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Pesanan Hari Ini
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-[#3E2723] font-semibold text-sm">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {staff.map((member) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-[#FAFAFA] hover:bg-[#FAFAFA] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            member.role === "admin"
                              ? "bg-amber-100"
                              : "bg-[#F5E6D3]"
                          }`}
                        >
                          {member.role === "admin" ? "👑" : "👤"}
                        </div>
                        <span className="font-medium text-[#3E2723] text-sm">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          member.role === "admin"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#F5E6D3] text-[#6F4E37]"
                        }`}
                      >
                        {member.role === "admin" ? "Admin" : "Barista"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#8B5E3C]">
                      {member.shift}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-[#3E2723] text-sm">
                        {member.ordersToday}
                      </span>
                      <span className="text-xs text-[#A0826D] ml-1">
                        pesanan
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          member.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {member.status === "active" ? "🟢 Aktif" : "⚪ Off"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {member.id !== currentUser?.id &&
                          member.username !== "admin" && (
                            <button
                              onClick={() => removeStaff(member.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Total stats */}
      <div className="bg-[#F5E6D3] rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">📊</span>
        <p className="text-sm text-[#6F4E37]">
          Total pesanan hari ini oleh semua staff:{" "}
          <span className="font-bold text-[#3E2723]">
            {totalOrdersToday} pesanan
          </span>
        </p>
      </div>
    </div>
  );
}
