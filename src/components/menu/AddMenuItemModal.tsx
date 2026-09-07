"use client";

import React, { useState, useEffect } from "react";
import { MenuService, CreateMenuItemPayload } from "@/services/menu.service";
import { X, Plus, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  apiError?: string;
}

const INITIAL_FORM: CreateMenuItemPayload = {
  name: "",
  description: "",
  price: 0,
  category: "Main Course",
  isAvailable: true,
};

export default function AddMenuItemModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<CreateMenuItemPayload>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Reset values and errors when modal closes or opens
  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Client-side validation logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Item name must be at least 2 characters.";
    }

    if (formData.price === undefined || formData.price === null || isNaN(formData.price)) {
      newErrors.price = "Price is required.";
    } else if (formData.price <= 0) {
      newErrors.price = "Price must be greater than $0.00.";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);
    try {
      await MenuService.createMenuItem({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      });
      
      resetForm(); // Clear inputs after successful submission
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to create menu item:", err);
      setErrors({
        apiError: err.response?.data?.message || "Failed to create menu item. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-500" /> Add Menu Item
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global API Error Alert */}
        {errors.apiError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Item Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full px-3.5 py-2 bg-slate-900 border ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
              } rounded-xl text-sm focus:outline-none focus:ring-2`}
              placeholder="e.g. Chicken Burger"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                  if (errors.price) setErrors({ ...errors, price: undefined });
                }}
                className={`w-full px-3.5 py-2 bg-slate-900 border ${
                  errors.price ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
                } rounded-xl text-sm focus:outline-none focus:ring-2`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: undefined });
                }}
                className={`w-full px-3.5 py-2 bg-slate-900 border ${
                  errors.category ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-indigo-500"
                } rounded-xl text-sm focus:outline-none focus:ring-2`}
              >
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Ingredients, dietary notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}