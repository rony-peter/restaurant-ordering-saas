"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MenuService, MenuItem } from "@/services/menu.service";
import AddMenuItemModal from "@/components/menu/AddMenuItemModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Plus, RefreshCw, Trash2, Utensils } from "lucide-react";

function MenuContent() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMenu = useCallback(async () => {
    if (!user?.restaurantId) return;
    try {
      setLoading(true);
      const data = await MenuService.getMenuItems(user.restaurantId);
      setMenuItems(data);
    } catch (err) {
      console.error("Failed to load menu items:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.restaurantId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await MenuService.deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    try {
      // Optimistic UI update
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: newStatus } : i))
      );
      await MenuService.toggleAvailability(item.id, newStatus);
    } catch (err) {
      console.error("Failed to toggle status:", err);
      // Revert on failure
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: item.isAvailable } : i))
      );
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-[calc(100vh-65px)] text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Add, update, or remove food items available for customer ordering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMenu}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
            title="Refresh Menu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : menuItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/40 border border-dashed border-slate-700/80 rounded-2xl text-slate-400 flex flex-col items-center">
          <Utensils className="w-10 h-10 mb-3 text-slate-600" />
          <p className="font-semibold text-slate-300">No menu items found</p>
          <p className="text-xs text-slate-500 mt-1">Click "Add Item" to create your first item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white">{item.name}</h3>
                  <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-medium">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description || "No description provided."}</p>
                <span className="inline-block mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                    item.isAvailable
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {item.isAvailable ? "In Stock" : "Out of Stock"}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddMenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMenu}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
      <MenuContent />
    </ProtectedRoute>
  );
}