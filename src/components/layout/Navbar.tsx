"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Utensils,
  ClipboardList,
  LayoutGrid,
  BarChart3,
  LogOut,
  User,
  BookOpen,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isManagerOrAdmin = user.role === "MANAGER" || user.role === "ADMIN";

  const navLinks = [
    { href: "/kds", label: "KDS", icon: Utensils, show: true },
    { href: "/orders", label: "Orders", icon: ClipboardList, show: isManagerOrAdmin },
    { href: "/tables", label: "Tables", icon: LayoutGrid, show: isManagerOrAdmin },
    { href: "/menu", label: "Menu", icon: BookOpen, show: isManagerOrAdmin },
    { href: "/analytics", label: "Analytics", icon: BarChart3, show: user.role === "ADMIN" },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            R
          </div>
          <span className="font-bold text-lg text-white tracking-wide">
            OpsPortal
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          {navLinks
            .filter((link) => link.show)
            .map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700/60 px-3.5 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left text-xs">
            <p className="font-semibold text-slate-200 leading-tight">{user.email}</p>
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300">
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}