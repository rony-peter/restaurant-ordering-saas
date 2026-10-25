"use client";

import React from "react";
import Link from "next/link";
import { Settings, Receipt, CreditCard, ChevronRight } from "lucide-react";

export default function SettingsOverviewPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-white">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" /> Settings & Configuration
        </h1>
        <p className="text-sm text-slate-400">Manage your restaurant billing rules, tax rates, and SaaS subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/settings/billing" 
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all group flex items-center justify-between shadow-lg"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Billing & Tax Settings</h2>
            <p className="text-xs text-slate-400">Configure tax modes, GST rates, service charges, packaging fees, and live receipt rules.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </Link>

        <Link 
          href="/settings/subscription" 
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all group flex items-center justify-between shadow-lg"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Subscription & Plan</h2>
            <p className="text-xs text-slate-400">View your active SaaS tier, trial status, billing cycle, and upgrade options.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
}