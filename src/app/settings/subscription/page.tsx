"use client";

import { useEffect, useState } from "react";
import { SubscriptionUsageCard } from "@/components/subscription/SubscriptionUsageCard";
import { SubscriptionPlansModal } from "@/components/subscription/SubscriptionPlansModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSubscription } from "../../../components/hooks/useSubscription";
import { SubscriptionStatus, SubscriptionTier } from "@/types/subscription";

function BillingContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // One hook instance for the whole page, so the plan card and the modal always show the same data.
  const sub = useSubscription();
  const { subscription, notice } = sub;

  // Close the plans window once a payment has gone through.
  useEffect(() => {
    if (notice) setIsModalOpen(false);
  }, [notice]);

  const needsPayment =
    subscription &&
    subscription.tier !== SubscriptionTier.FREE &&
    (subscription.status === SubscriptionStatus.HALTED || subscription.status === SubscriptionStatus.PAUSED);

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

        {notice && (
          <div role="status" className="p-4 text-sm text-emerald-300 bg-emerald-950/40 rounded-xl border border-emerald-800/60">
            {notice}
          </div>
        )}

        {sub.error && !isModalOpen && (
          <div role="alert" className="p-4 text-sm text-red-400 bg-red-950/40 rounded-xl border border-red-800/60">
            {sub.error}
          </div>
        )}

        {needsPayment && (
          <div role="alert" className="p-4 text-sm text-amber-300 bg-amber-950/30 rounded-xl border border-amber-800/60 flex flex-wrap items-center justify-between gap-3">
            <span>Your last payment didn&rsquo;t go through, so your plan is on hold. Subscribe again to restore access.</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition"
            >
              Fix payment
            </button>
          </div>
        )}

        <SubscriptionUsageCard
          subscription={sub.subscription}
          loading={sub.loading}
          error={sub.loadError}
          cancelling={sub.cancelling}
          onCancel={sub.cancelSubscription}
        />

        <SubscriptionPlansModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subscription={sub.subscription}
          initiateCheckout={sub.initiateCheckout}
          subscribing={sub.subscribing}
          error={sub.error}
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