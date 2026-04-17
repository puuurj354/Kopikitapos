import type { MenuItem, WeeklySale, CategoryData, Order, HourlySale } from '../types/pos';

export const menuItems: MenuItem[] = [
  { id: 1, name: 'Espresso', price: 25000, category: 'coffee', emoji: '☕', image: 'https://img.icons8.com/color/96/espresso-cup.png' },
  { id: 2, name: 'Cappuccino', price: 35000, category: 'coffee', emoji: '☕', image: 'https://img.icons8.com/color/96/cappuccino.png' },
  { id: 3, name: 'Latte', price: 38000, category: 'coffee', emoji: '🥛', image: 'https://img.icons8.com/color/96/latte.png' },
  { id: 4, name: 'Americano', price: 28000, category: 'coffee', emoji: '🫗', image: 'https://img.icons8.com/color/96/coffee-to-go.png' },
  { id: 5, name: 'Mocha', price: 40000, category: 'coffee', emoji: '🍫', image: 'https://img.icons8.com/color/96/hot-chocolate.png' },
  { id: 6, name: 'Caramel Macchiato', price: 42000, category: 'coffee', emoji: '🍯', image: 'https://img.icons8.com/color/96/iced-coffee.png' },
  { id: 7, name: 'Cold Brew', price: 35000, category: 'coffee', emoji: '🧊', image: 'https://img.icons8.com/color/96/iced-coffee.png' },
  { id: 8, name: 'Matcha Latte', price: 38000, category: 'non-coffee', emoji: '🍵', image: 'https://img.icons8.com/color/96/green-tea.png' },
  { id: 9, name: 'Chocolate', price: 35000, category: 'non-coffee', emoji: '🍫', image: 'https://img.icons8.com/color/96/hot-chocolate.png' },
  { id: 10, name: 'Fresh Juice', price: 30000, category: 'non-coffee', emoji: '🧃', image: 'https://img.icons8.com/color/96/orange-juice.png' },
  { id: 11, name: 'Croissant', price: 28000, category: 'food', emoji: '🥐', image: 'https://img.icons8.com/color/96/croissant.png' },
  { id: 12, name: 'Sandwich', price: 35000, category: 'food', emoji: '🥪', image: 'https://img.icons8.com/color/96/sandwich.png' },
  { id: 13, name: 'Muffin', price: 22000, category: 'food', emoji: '🧁', image: 'https://img.icons8.com/color/96/muffin.png' },
  { id: 14, name: 'Cookies', price: 18000, category: 'food', emoji: '🍪', image: 'https://img.icons8.com/color/96/cookie.png' },
  { id: 15, name: 'Cheese Cake', price: 45000, category: 'food', emoji: '🍰', image: 'https://img.icons8.com/color/96/cheesecake.png' },
  { id: 16, name: 'Brownies', price: 25000, category: 'food', emoji: '🍫', image: 'https://img.icons8.com/color/96/brownie.png' },
];

export const weeklySales: WeeklySale[] = [
  { name: 'Sen', sales: 1250000, orders: 42 },
  { name: 'Sel', sales: 1580000, orders: 55 },
  { name: 'Rab', sales: 1320000, orders: 47 },
  { name: 'Kam', sales: 1650000, orders: 58 },
  { name: 'Jum', sales: 2100000, orders: 72 },
  { name: 'Sab', sales: 2450000, orders: 85 },
  { name: 'Min', sales: 1980000, orders: 68 },
];

export const categoryData: CategoryData[] = [
  { name: 'Kopi', value: 45, color: '#6F4E37' },
  { name: 'Non-Kopi', value: 20, color: '#A0522D' },
  { name: 'Makanan', value: 35, color: '#D4A574' },
];

export const recentOrders: Order[] = [
  { id: 'ORD-001', items: 3, total: 115000, status: 'completed', time: '09:30', table: 5 },
  { id: 'ORD-002', items: 2, total: 73000, status: 'completed', time: '09:45', table: 2 },
  { id: 'ORD-003', items: 5, total: 198000, status: 'preparing', time: '10:00', table: 8 },
  { id: 'ORD-004', items: 1, total: 38000, status: 'preparing', time: '10:15', table: 1 },
  { id: 'ORD-005', items: 4, total: 156000, status: 'pending', time: '10:30', table: 3 },
  { id: 'ORD-006', items: 2, total: 63000, status: 'completed', time: '10:45', table: 6 },
  { id: 'ORD-007', items: 3, total: 105000, status: 'preparing', time: '11:00', table: 4 },
  { id: 'ORD-008', items: 6, total: 245000, status: 'completed', time: '11:15', table: 7 },
];

export const hourlyData: HourlySale[] = [
  { hour: '08:00', sales: 250000 },
  { hour: '09:00', sales: 480000 },
  { hour: '10:00', sales: 720000 },
  { hour: '11:00', sales: 950000 },
  { hour: '12:00', sales: 1200000 },
  { hour: '13:00', sales: 890000 },
  { hour: '14:00', sales: 650000 },
  { hour: '15:00', sales: 520000 },
  { hour: '16:00', sales: 410000 },
];
