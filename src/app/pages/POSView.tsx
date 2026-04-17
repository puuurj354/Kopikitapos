import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { usePOS } from "../context/POSContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import type { MenuItem } from "../types/pos";
import { MenuItemCard } from "../components/MenuItemCard";
import { CartItemCard } from "../components/CartItemCard";
import { PaymentModal } from "../components/PaymentModal";

export function POSView() {
  const { cart, clearCart } = usePOS();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [tableNumber, setTableNumber] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["pos-menu"],
    queryFn: async () => {
      let finalCategories = [{ id: "all", label: "Semua", icon: "📋" }];
      let finalMenuItems: MenuItem[] = [];

      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (catData) {
        const dynamicCats = catData.map((c: any) => {
          let icon = "🏷️";
          const nameLower = c.name.toLowerCase();
          if (nameLower.includes("kopi") || nameLower.includes("coffee"))
            icon = "☕";
          else if (nameLower.includes("food") || nameLower.includes("makanan"))
            icon = "🍽️";
          else if (nameLower.includes("non-coffee")) icon = "🍵";

          return {
            id: c.name,
            label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
            icon,
          };
        });
        finalCategories = [
          { id: "all", label: "Semua", icon: "📋" },
          ...dynamicCats,
        ];
      }

      const { data: prodData, error } = await supabase.from("products").select(`
          id,
          name,
          price,
          image_url,
          is_available,
          categories(name)
        `);

      if (prodData && !error) {
        finalMenuItems = prodData.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.categories?.name || "other",
          emoji: item.image_url,
          image: item.image_url,
          available: item.is_available,
        }));
      }

      return { categories: finalCategories, menuItems: finalMenuItems };
    },
  });

  const categories = data?.categories || [
    { id: "all", label: "Semua", icon: "📋" },
  ];
  const menuItems = data?.menuItems || [];

  const filteredItems = useMemo(
    () =>
      activeCategory === "all"
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory),
    [activeCategory, menuItems],
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#6F4E37] text-white shadow-md"
                  : "bg-white text-[#8B5E3C] border border-[#F5E6D3] hover:bg-[#F5E6D3]"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 bg-white p-3 rounded-xl border border-[#F5E6D3]">
          <div className="flex items-center gap-3">
            <span className="text-[#8B5E3C] text-sm">🪑 Meja:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setTableNumber(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    tableNumber === num
                      ? "bg-[#6F4E37] text-white"
                      : "bg-[#F5E6D3] text-[#8B5E3C] hover:bg-[#E8D5C0]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-[#F5E6D3]"></div>
          <div className="flex items-center gap-3">
            <span className="text-[#8B5E3C] text-sm">👤 Pelanggan:</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama Pelanggan"
              className="p-1.5 px-3 w-full sm:w-48 text-sm rounded-lg border border-[#E8D5C0] outline-none focus:border-[#6F4E37] text-[#3E2723]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.div
        layout
        className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-[#F5E6D3] flex flex-col"
      >
        <div className="p-4 border-b border-[#F5E6D3] flex items-center justify-between">
          <h3 className="font-bold text-[#3E2723] flex items-center gap-2">
            <span>🛒</span> Pesanan
          </h3>
          <span className="bg-[#F5E6D3] text-[#6F4E37] text-xs px-2 py-1 rounded-full font-medium">
            Meja {tableNumber}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-[#A0826D]"
              >
                <span className="text-6xl mb-4">📋</span>
                <p className="text-sm">Belum ada pesanan</p>
                <p className="text-xs mt-1">Pilih menu untuk memulai</p>
              </motion.div>
            ) : (
              cart.map((item) => <CartItemCard key={item.id} item={item} />)
            )}
          </AnimatePresence>
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-[#F5E6D3] space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#8B5E3C]">Subtotal</span>
              <span className="text-[#3E2723] font-medium">
                Rp {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8B5E3C]">Pajak (10%)</span>
              <span className="text-[#3E2723] font-medium">
                Rp {tax.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-[#F5E6D3] pt-3">
              <span className="text-[#3E2723]">Total</span>
              <span className="text-[#6F4E37]">
                Rp {total.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCart}
                className="flex-1 py-3 rounded-xl border-2 border-[#D4A574] text-[#6F4E37] font-medium hover:bg-[#F5E6D3] transition-colors"
              >
                Batal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPayment(true)}
                className="flex-1 py-3 rounded-xl bg-[#6F4E37] text-white font-medium hover:bg-[#5D4037] transition-colors shadow-lg"
              >
                Bayar
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            total={total}
            tableNumber={tableNumber}
            customerName={customerName || "Walk-in Customer"}
            userId={user?.id}
            onClose={() => setShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
