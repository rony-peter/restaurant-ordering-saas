"use client";

import { useState } from "react";
import { SubscriptionUsageCard } from "@/components/subscription/SubscriptionUsageCard";
import { SubscriptionPlansModal } from "@/components/subscription/SubscriptionPlansModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function BillingContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Subscription & Billing</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your restaurant tier and resource quotas.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 active:scale-95 border border-indigo-500/30"
          >
            Upgrade / Change Plan
          </button>
        </div>

        <SubscriptionUsageCard />

        <SubscriptionPlansModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <BillingContent />
    </ProtectedRoute>
  );
}