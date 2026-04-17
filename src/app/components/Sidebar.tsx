import { motion } from 'motion/react';
import { usePOS } from '../context/POSContext';
import { useAuth } from '../context/AuthContext';
import type { ViewType } from '../types/pos';

interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const allNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', adminOnly: true },
  { id: 'pos', label: 'POS Order', icon: '🛒' },
  { id: 'orders', label: 'Pesanan', icon: '📋' },
  { id: 'menu', label: 'Kelola Menu', icon: '🍽️', adminOnly: true },
  { id: 'reports', label: 'Laporan', icon: '📈', adminOnly: true },
  { id: 'staff', label: 'Staff', icon: '👥', adminOnly: true },
];

export function Sidebar() {
  const { currentView, setCurrentView, cart } = usePOS();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const roleBadge = isAdmin
    ? { label: 'Admin', color: 'bg-amber-500 text-white' }
    : { label: 'Barista', color: 'bg-[#A0826D] text-white' };

  return (
    <motion.div
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      className="w-20 lg:w-64 bg-[#3E2723] text-white flex flex-col min-h-screen fixed left-0 top-0 z-30"
    >
      {/* Logo */}
      <div className="p-4 lg:p-6 flex items-center gap-3 border-b border-[#5D4037]">
        <div className="w-10 h-10 bg-[#6F4E37] rounded-xl flex items-center justify-center text-xl shrink-0">☕</div>
        <div className="hidden lg:block">
          <span className="text-lg font-bold block leading-tight">KopiKita</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadge.color}`}>{roleBadge.label}</span>
        </div>
      </div>

      {/* Role badge (mobile) */}
      <div className="lg:hidden flex justify-center py-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${roleBadge.color}`}>
          {isAdmin ? '★' : '●'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 lg:px-4 space-y-1">
        {/* Admin section header */}
        {isAdmin && (
          <p className="hidden lg:block text-[10px] uppercase tracking-widest text-[#A0826D] px-3 pb-1 pt-2">Admin</p>
        )}
        {navItems.slice(0, isAdmin ? 3 : 2).map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            cart={item.id === 'pos' ? cart.length : 0}
            onClick={() => setCurrentView(item.id)}
          />
        ))}

        {/* Admin-only extras */}
        {isAdmin && navItems.length > 3 && (
          <>
            <p className="hidden lg:block text-[10px] uppercase tracking-widest text-[#A0826D] px-3 pb-1 pt-4">Manajemen</p>
            {navItems.slice(3).map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isActive={currentView === item.id}
                cart={0}
                onClick={() => setCurrentView(item.id)}
              />
            ))}
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#5D4037]">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${isAdmin ? 'bg-amber-500' : 'bg-[#6F4E37]'}`}>
            {isAdmin ? '👑' : '👤'}
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-[#A0826D]">{user?.shift ?? ''}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="hidden lg:flex items-center justify-center w-8 h-8 text-[#A0826D] hover:text-white hover:bg-[#4E342E] rounded-lg transition-colors cursor-pointer"
          >
            🚪
          </button>
        </div>
        {/* Mobile logout */}
        <button
          onClick={logout}
          title="Logout"
          className="lg:hidden mt-2 w-full flex items-center justify-center text-[#A0826D] hover:text-white transition-colors cursor-pointer"
        >
          🚪
        </button>
      </div>
    </motion.div>
  );
}

function NavButton({
  item,
  isActive,
  cart,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  cart: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
        isActive
          ? 'bg-[#6F4E37] text-white shadow-lg'
          : 'text-[#D4A574] hover:bg-[#4E342E] hover:text-white'
      }`}
    >
      <span className="text-xl shrink-0">{item.icon}</span>
      <span className="hidden lg:block font-medium text-sm">{item.label}</span>
      {item.id === 'pos' && cart > 0 && (
        <span className="hidden lg:flex ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 items-center justify-center">
          {cart}
        </span>
      )}
    </motion.button>
  );
}
