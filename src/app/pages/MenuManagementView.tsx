import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import type { MenuItem } from "../types/pos";

export function MenuManagementView() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: menuData } = useQuery({
    queryKey: ["menu-management"],
    queryFn: async () => {
      let catMap: Record<string, string> = {};
      let catList: { id: string; name: string }[] = [];
      let menuItems: MenuItem[] = [];

      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) {
        catData.forEach((c: any) => {
          catMap[c.name] = c.id;
        });
        catList = catData.map((c: any) => ({ id: c.id, name: c.name }));
      }

      const { data, error } = await supabase
        .from("products")
        .select(`*, categories(name)`);
      if (data && !error) {
        menuItems = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.categories?.name || "other",
          emoji: item.image_url,
          image: item.image_url,
          available: item.is_available,
        }));
      }

      return {
        categoriesMap: catMap,
        categoriesList: catList,
        items: menuItems,
      };
    },
  });

  const categoriesMap = menuData?.categoriesMap || {};
  const categoriesList = menuData?.categoriesList || [];
  const items = menuData?.items || [];
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "coffee" as MenuItem["category"],
    emoji: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");

  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({
      id,
      is_available,
    }: {
      id: string | number;
      is_available: boolean;
    }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_available })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-management"] });
      queryClient.invalidateQueries({ queryKey: ["pos-menu"] });
    },
  });

  const toggleAvailability = (id: string | number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    toggleAvailabilityMutation.mutate({ id, is_available: !item.available });
  };

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-management"] });
      queryClient.invalidateQueries({ queryKey: ["pos-menu"] });
    },
  });

  const deleteItem = (id: string | number) => {
    deleteItemMutation.mutate(id);
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      emoji: item.emoji,
    });
    setImageFile(null);
    setShowAddForm(true);
    setFormError("");
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "coffee", emoji: "" });
    setImageFile(null);
    setShowAddForm(false);
    setEditingId(null);
    setFormError("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setFormError("Nama menu harus diisi");
      return;
    }
    const price = parseInt(form.price);
    if (!price || price < 1000) {
      setFormError("Harga minimal Rp 1.000");
      return;
    }

    setUploading(true);
    setFormError("");

    let imageUrl = form.emoji;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        setFormError(
          "Gagal mengunggah gambar. Pastikan bucket 'menu-images' sudah dibuat di Supabase dan public.",
        );
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const category_id = categoriesMap[form.category];

    if (editingId !== null) {
      const { error } = await supabase
        .from("products")
        .update({
          name: form.name.trim(),
          price,
          category_id,
          image_url: imageUrl,
        })
        .eq("id", editingId);

      if (error) {
        setFormError("Gagal menyimpan perubahan");
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: form.name.trim(),
          price,
          category_id,
          image_url: imageUrl,
          is_available: true,
        })
        .select()
        .single();

      if (error) {
        setFormError("Gagal menambahkan menu");
      }
    }
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ["menu-management"] });
    queryClient.invalidateQueries({ queryKey: ["pos-menu"] });
    resetForm();
  };

  const availableCount = items.filter((i) => i.available !== false).length;
  const unavailableCount = items.length - availableCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#3E2723]">
            Kelola Menu
          </h1>
          <p className="text-[#8B5E3C] mt-1">
            {items.length} item · {availableCount} tersedia · {unavailableCount}{" "}
            tidak tersedia
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
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
            <h3 className="font-bold text-[#3E2723] mb-4">
              {editingId ? "✏️ Edit Menu" : "➕ Tambah Menu Baru"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Nama Menu
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Contoh: Caramel Latte"
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Harga (Rp)
                </label>
                <input
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      price: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  placeholder="35000"
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Kategori
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      category: e.target.value as MenuItem["category"],
                    }))
                  }
                  className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors cursor-pointer"
                >
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#8B5E3C] mb-1 block">
                  Upload Gambar (opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] focus:border-[#6F4E37] outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#F5E6D3] file:text-[#6F4E37] hover:file:bg-[#E8D5C0] file:cursor-pointer"
                />
                {form.emoji && !imageFile && (
                  <p className="text-xs text-[#8B5E3C] mt-2">
                    Gambar saat ini sudah tersimpan. Upload baru untuk
                    mengganti.
                  </p>
                )}
              </div>
            </div>
            {formError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-5 py-2.5 bg-[#6F4E37] text-white rounded-xl text-sm font-medium hover:bg-[#5D4037] transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploading
                  ? "Mengunggah..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Tambahkan"}
              </button>
              <button
                onClick={resetForm}
                disabled={uploading}
                className="px-5 py-2.5 bg-[#F5E6D3] text-[#6F4E37] rounded-xl text-sm font-medium hover:bg-[#E8D5C0] transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#6F4E37] text-white"
                : "bg-white text-[#8B5E3C] border border-[#F5E6D3] hover:bg-[#F5E6D3]"
            }`}
          >
            📋 Semua
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.name
                  ? "bg-[#6F4E37] text-white"
                  : "bg-white text-[#8B5E3C] border border-[#F5E6D3] hover:bg-[#F5E6D3]"
              }`}
            >
              🏷️ {cat.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="text-sm text-[#6F4E37] font-medium whitespace-nowrap px-3 py-1.5 border border-[#D4A574] rounded-lg hover:bg-[#F5E6D3] transition-colors"
        >
          + Kategori
        </button>
      </div>

      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-bold text-[#3E2723] mb-4">
                Tambah Kategori Baru
              </h3>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nama Kategori (misal: Snack)"
                className="w-full p-2.5 rounded-xl border-2 border-[#E8D5C0] text-[#3E2723] mb-4 outline-none focus:border-[#6F4E37]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-[#8B5E3C] bg-[#F5E6D3] rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    if (!newCategoryName.trim()) return;
                    await supabase
                      .from("categories")
                      .insert({ name: newCategoryName.trim() });
                    setNewCategoryName("");
                    setShowCategoryModal(false);
                    queryClient.invalidateQueries({
                      queryKey: ["menu-management"],
                    });
                    queryClient.invalidateQueries({ queryKey: ["pos-menu"] });
                  }}
                  className="px-4 py-2 text-white bg-[#6F4E37] rounded-xl font-medium"
                >
                  Simpan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                item.available === false
                  ? "opacity-50 border-gray-200"
                  : "border-[#F5E6D3]"
              }`}
            >
              <div className="w-full h-32 bg-[#E8D5C0] rounded-xl flex items-center justify-center text-4xl mb-3 relative overflow-hidden">
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
                {item.available === false && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-gray-700 font-bold backdrop-blur-[1px]">
                    Tidak Tersedia
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-[#3E2723] text-sm">
                {item.name}
              </h4>
              <p className="text-xs text-[#A0826D] capitalize mb-2">
                {item.category === "coffee"
                  ? "Kopi"
                  : item.category === "non-coffee"
                    ? "Non-Kopi"
                    : "Makanan"}
              </p>
              <p className="text-[#6F4E37] font-bold text-sm mt-auto">
                Rp {item.price.toLocaleString()}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    item.available !== false
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.available !== false ? "✓ Aktif" : "✗ Nonaktif"}
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
