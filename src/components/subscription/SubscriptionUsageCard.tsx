"use client";

import React from "react";
import { CurrentSubscriptionResponse, SubscriptionStatus, SubscriptionTier } from "@/types/subscription";

function ProgressBar({ label, current, max }: { label: string; current: number; max: number }) {
  const isUnlimited = !Number.isFinite(max) || max >= 999999;
  const isOverLimit = !isUnlimited && current > max;
  const percentage = isUnlimited ? 5 : max <= 0 ? 100 : Math.min(100, Math.round((current / max) * 100));

  let barColor = "bg-indigo-500";
  if (isOverLimit || percentage >= 90) barColor = "bg-red-500";
  else if (percentage >= 80) barColor = "bg-amber-500";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-slate-300 flex items-center gap-2">
          {label}
          {isOverLimit && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
              Exceeded
            </span>
          )}
        </span>
        <span className={`font-semibold ${isOverLimit ? "text-red-400" : "text-slate-300"}`}>
          {isUnlimited ? `${current} / Unlimited` : `${current} / ${max}`}
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;

interface Props {
  subscription: CurrentSubscriptionResponse | null;
  loading: boolean;
  error: string | null;
  cancelling: boolean;
  onCancel: () => void;
}

export function SubscriptionUsageCard({ subscription, loading, error, cancelling, onCancel }: Props) {
  if (loading) {
    return (
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl animate-pulse text-slate-400 text-sm">
        Loading plan usage details...
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-400 text-sm">
        {error || "Failed to load plan usage."}
      </div>
    );
  }

  const { tier, status, usage, limits, currentPeriodEnd, cancelAtPeriodEnd } = subscription;
  const isPaidActive = tier !== SubscriptionTier.FREE && status === SubscriptionStatus.ACTIVE;
  const endDate = formatDate(currentPeriodEnd);

  const handleCancel = () => {
    const when = endDate ? `on ${endDate}` : "at the end of the billing period";
    if (window.confirm(`Cancel your plan? You keep access until ${when}, then move to the Free plan.`)) {
      onCancel();
    }
  };

  return (
    <div className="p-6 md:p-8 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-white">Current Plan Usage</h3>
          {isPaidActive && endDate && (
            <p className="text-xs text-slate-400 mt-1">
              {cancelAtPeriodEnd ? `Ends on ${endDate}` : `Renews on ${endDate}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status !== SubscriptionStatus.ACTIVE && (
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {status}
            </span>
          )}
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {tier}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <ProgressBar label="Tables" current={usage.tablesCount} max={limits.maxTables} />
        <ProgressBar label="Staff Accounts" current={usage.staffCount} max={limits.maxStaff} />
        <ProgressBar label="Menu Items" current={usage.menuItemsCount} max={limits.maxMenuItems} />
      </div>

      {isPaidActive && !cancelAtPeriodEnd && (
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-xs font-semibold text-slate-400 hover:text-red-400 transition disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel plan"}
          </button>
        </div>
      )}
    </div>
  );
}