import React, { memo } from "react";
import { motion } from "motion/react";
import { usePOS } from "../context/POSContext";
import type { CartItem } from "../types/pos";

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard = memo(function CartItemCard({
  item,
}: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = usePOS();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-xl"
    >
      <div className="w-10 h-10 bg-[#E8D5C0] rounded-lg flex items-center justify-center text-xl overflow-hidden shrink-0">
        {(item.image && item.image.startsWith("http")) ||
        (item.emoji && item.emoji.startsWith("http")) ? (
          <img
            src={item.image || item.emoji}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[#A0826D] text-xs font-bold">
            {item.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#3E2723] truncate">
          {item.name}
        </p>
        <p className="text-xs text-[#8B5E3C]">
          Rp {item.price.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-6 h-6 bg-white border border-[#D4A574] rounded-md flex items-center justify-center text-[#6F4E37] text-sm hover:bg-[#F5E6D3]"
        >
          −
        </button>
        <span className="text-sm font-medium text-[#3E2723] w-5 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-6 h-6 bg-[#6F4E37] text-white rounded-md flex items-center justify-center text-sm hover:bg-[#5D4037]"
        >
          +
        </button>
      </div>
      <button
        onClick={() => removeFromCart(item.id)}
        className="text-red-400 hover:text-red-600 text-lg ml-1"
      >
        ×
      </button>
    </motion.div>
  );
});
