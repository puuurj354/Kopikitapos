import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { menuItems as initialMenu } from '../data/menu';
import type { MenuItem } from '../types/pos';

const CATEGORIES = [
  { id: 'all', label: 'Semua', emoji: '📋' },
  { id: 'coffee', label: 'Kopi', emoji: '☕' },
  { id: 'non-coffee', label: 'Non-Kopi', emoji: '🍵' },
  { id: 'food', label: 'Makanan', emoji: '🍽️' },
] as const;

const EMOJI_OPTIONS = ['☕', '🥛', '🍫', '🧃', '🍵', '🍰', '🥐', '🥪', '🧁', '🍪', '🫗', '🧊', '🍯'];

export function MenuManagementView() {
  const [items, setItems] = useState<MenuItem[]>(
    initialMenu.map((m) => ({ ...m, available: true }))
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: 'coffee' as MenuItem['category'], emoji: '☕' });
  const [formError, setFormError] = useState('');

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);

  const toggleAvailability = (id: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({ name: item.name, price: String(item.price), category: item.category, emoji: item.emoji });
    setShowAddForm(true);
    setFormError('');
  };

  const resetForm = () => {
    setForm({ name: '', price: '', category: 'coffee', emoji: '☕' });
    setShowAddForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { setFormError('Nama menu harus diisi'); return; }
    const price = parseInt(form.price);
    if (!price || price < 1000) { setFormError('Harga minimal Rp 1.000'); return; }

    if (editingId !== null) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? { ...i, name: form.name.trim(), price, category: form.category, emoji: form.emoji }
            : i
        )
      );
    } else {
      const newItem: MenuItem = {
        id: Date.now(),
        name: form.name.trim(),
        price,
        category: form.category,
        emoji: form.emoji,
        image: '',
        available: true,
      };
      setItems((prev) => [...prev, newItem]);
    }
    resetForm();
  };

  const availableCount = items.filter((i) => i.available !== false).length;
  const unavailableCount = items.length - availableCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#3E2723]">Kelola Menu</h1>
          <p className="text-[#8B5E3C] mt-1">{items.length} item · {availableCount} tersedia · {unavailableCount} tidak tersedia</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 bg-[#6F4E37] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#5D4037] transition-colors shadow-md cursor-pointer"
        >
          <span>＋</span> Tambah Menu
        </motion.button>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-[#F5E6D3] shadow-sm p-6"
          >
            <h3 className="font-bold text-[#3E2723] mb-4">{editingId ? '✏️ Edit Menu' : '➕ Tambah Menu Baru'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">Nama Menu</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Caramel Latte"
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">Harga (Rp)</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value.replace(/[^0-9]/g, '') }))}
                  placeholder="35000"
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as MenuItem['category'] }))}
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors cursor-pointer"
                >
                  <option value="coffee">Kopi</option>
                  <option value="non-coffee">Non-Kopi</option>
                  <option value="food">Makanan</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                      className={`w-9 h-9 rounded-lg text-lg border-2 transition-colors cursor-pointer ${
                        form.emoji === e ? 'border-[#6F4E37] bg-[#F5E6D3]' : 'border-transparent hover:border-[#D4A574]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {formError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-[#6F4E37] text-white rounded-xl text-sm font-medium hover:bg-[#5D4037] transition-colors cursor-pointer"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
              <button
                onClick={resetForm}
                className="px-5 py-2.5 bg-[#F5E6D3] text-[#6F4E37] rounded-xl text-sm font-medium hover:bg-[#E8D5C0] transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#6F4E37] text-white'
                : 'bg-white text-[#8B5E3C] border border-[#F5E6D3] hover:bg-[#F5E6D3]'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white rounded-2xl p-4 border shadow-sm flex flex-col transition-opacity ${
                item.available === false ? 'opacity-50 border-gray-200' : 'border-[#F5E6D3]'
              }`}
            >
              <div className="w-full h-20 bg-[#F5E6D3] rounded-xl flex items-center justify-center text-4xl mb-3 relative">
                {item.emoji}
                {item.available === false && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl text-xs text-gray-500 font-medium">
                    Tidak Tersedia
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-[#3E2723] text-sm">{item.name}</h4>
              <p className="text-xs text-[#A0826D] capitalize mb-2">
                {item.category === 'coffee' ? 'Kopi' : item.category === 'non-coffee' ? 'Non-Kopi' : 'Makanan'}
              </p>
              <p className="text-[#6F4E37] font-bold text-sm mt-auto">Rp {item.price.toLocaleString()}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    item.available !== false
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.available !== false ? '✓ Aktif' : '✗ Nonaktif'}
                </button>
                <button
                  onClick={() => startEdit(item)}
                  className="px-3 py-1.5 bg-[#F5E6D3] text-[#6F4E37] rounded-lg text-xs font-medium hover:bg-[#E8D5C0] transition-colors cursor-pointer"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors cursor-pointer"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
