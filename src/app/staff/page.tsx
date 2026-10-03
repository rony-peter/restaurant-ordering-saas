"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthService, StaffUser } from "@/services/auth.service";
import { UserPlus, ShieldCheck, Utensils, User, Trash2, RefreshCw, Users } from "lucide-react";

function StaffContent() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MANAGER" | "COOK">("COOK");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await AuthService.getStaffList();
      setStaffList(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setAdding(true);
      setError(null);
      const newStaff = await AuthService.registerStaff({ email, password, role });
      setStaffList((prev) => [...prev, newStaff]);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.message || "Failed to add staff member";
      setError(serverMessage);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    // Prevent deletion if only 1 staff member exists
    if (staffList.length <= 1) {
      setError("Cannot delete the last staff account. At least one account must remain.");
      return;
    }

    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      setError(null);
      await AuthService.deleteStaff(id);
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete staff member");
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> ADMIN
          </span>
        );
      case "MANAGER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <User className="w-3.5 h-3.5" /> MANAGER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Utensils className="w-3.5 h-3.5" /> COOK
          </span>
        );
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-[calc(100vh-65px)] text-white space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Create and manage accounts for Cooks (Kitchen Display), Managers, and Admins.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="text-red-400/70 hover:text-red-300 text-xs ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form: Add New Staff Member */}
      <form
        onSubmit={handleAddStaff}
        className="p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
          <input
            type="email"
            required
            placeholder="staff@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          >
            <option value="COOK">COOK (Kitchen Display)</option>
            <option value="MANAGER">MANAGER (Orders & Tables)</option>
            <option value="ADMIN">ADMIN (Full Control)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {adding ? "Creating..." : "Add Staff Member"}
        </button>
      </form>

      {/* Staff Table / Empty State */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : staffList.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-800/40 border border-dashed border-slate-700/80 rounded-2xl p-16 text-center text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
          <p className="text-sm font-medium text-slate-300">No staff members found.</p>
          <p className="text-xs text-slate-500 mt-1">Add a staff member using the form above.</p>
        </div>
      ) : (
        /* Staff Table */
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800 border-b border-slate-700 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{s.email}</td>
                  <td className="px-6 py-4">{getRoleBadge(s.role)}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteStaff(s.id)}
                      disabled={staffList.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 rounded-lg transition-colors"
                      title={staffList.length <= 1 ? "At least one staff account must remain" : "Delete Staff Member"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StaffPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
      <StaffContent />
    </ProtectedRoute>
  );
}