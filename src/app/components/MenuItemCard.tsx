import React, { memo } from "react";
import { motion } from "motion/react";
import { usePOS } from "../context/POSContext";
import type { MenuItem } from "../types/pos";

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard = memo(function MenuItemCard({
  item,
}: MenuItemCardProps) {
  const { addToCart } = usePOS();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-[#F5E6D3] flex flex-col"
    >
      <div className="w-full h-32 bg-[#E8D5C0] rounded-xl flex items-center justify-center text-5xl mb-3 overflow-hidden">
        {(item.image && item.image.startsWith("http")) ||
        (item.emoji && item.emoji.startsWith("http")) ? (
          <img
            src={item.image || item.emoji}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[#A0826D] text-sm font-medium">
            Tanpa Gambar
          </span>
        )}
      </div>
      <h4 className="font-semibold text-[#3E2723] text-sm mb-1">{item.name}</h4>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-[#6F4E37] font-bold text-sm">
          Rp {item.price.toLocaleString()}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => addToCart(item)}
          className="bg-[#6F4E37] text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-[#5D4037] transition-colors"
        >
          +
        </motion.button>
      </div>
    </motion.div>
  );
});
