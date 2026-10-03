"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  RefreshCw,
  BarChart2,
} from "lucide-react";

function AnalyticsContent() {
  const [loading, setLoading] = useState(false);

  // Mock analytics data - replace with your API call (e.g. AnalyticsService.getStats())
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,450.00",
      change: "+14.2%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: "482",
      change: "+8.1%",
      isPositive: true,
      icon: ShoppingBag,
    },
    {
      title: "Avg. Order Value",
      value: "$25.83",
      change: "-2.3%",
      isPositive: false,
      icon: TrendingUp,
    },
    {
      title: "Active Staff",
      value: "6",
      change: "Stable",
      isPositive: true,
      icon: Users,
    },
  ];

  return (
    <div className="p-6 bg-slate-900 min-h-[calc(100vh-65px)] text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time performance metrics and sales insight for your restaurant.
          </p>
        </div>

        <button
          onClick={() => setLoading(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                <span
                  className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-md ${
                    stat.isPositive
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {stat.change} vs last week
                </span>
              </div>
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Placeholder Area */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <BarChart2 className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-semibold text-white">Sales & Revenue Breakdown</h3>
        <p className="text-slate-400 text-sm max-w-md mt-1">
          Detailed sales charts and order volume reports will render here as order data populates.
        </p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}