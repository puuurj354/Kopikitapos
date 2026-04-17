export type UserRole = "barista" | "admin";

export interface MenuItem {
  id: string | number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  image: string;
  available?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: number;
  total: number;
  status: "completed" | "preparing" | "pending";
  time: string;
  table: number;
}

export interface WeeklySale {
  name: string;
  sales: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface HourlySale {
  hour: string;
  sales: number;
}

export interface StaffMember {
  id: string | number;
  name: string;
  role: UserRole;
  shift: string;
  ordersToday: number;
  status: "active" | "off";
}

export type ViewType =
  | "dashboard"
  | "pos"
  | "orders"
  | "menu"
  | "reports"
  | "staff";

export type PaymentMethod = "cash" | "debit" | "qris";

export type OrderFilter = "all" | "pending" | "preparing" | "completed";
