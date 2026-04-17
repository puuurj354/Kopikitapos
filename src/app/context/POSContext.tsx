import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CartItem, MenuItem, ViewType } from '../types/pos';

interface POSContextType {
  cart: CartItem[];
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  addToCart: (item: MenuItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

const POSContext = createContext<POSContextType | null>(null);

export function usePOS(): POSContextType {
  const ctx = useContext(POSContext);
  if (!ctx) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return ctx;
}

interface POSProviderProps {
  children: React.ReactNode;
  initialView?: ViewType;
}

export function POSProvider({ children, initialView = 'dashboard' }: POSProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>(initialView);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const value = useMemo(() => ({
    cart,
    currentView,
    setCurrentView,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }), [cart, currentView, addToCart, updateQuantity, removeFromCart, clearCart]);

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
}
