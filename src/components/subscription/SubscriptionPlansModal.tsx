"use client";

import React, { useState } from "react";
import { SubscriptionTier } from "@/types/subscription";
import { useSubscription } from "../hooks/useSubscription";

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionPlansModal({ isOpen, onClose }: SubscriptionPlansModalProps) {
  const { subscription, initiateCheckout, subscribing, error } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  if (!isOpen) return null;

  const currentTier = subscription?.tier || SubscriptionTier.FREE;

  const PLAN_CARDS = [
    {
      tier: SubscriptionTier.FREE,
      name: "FREE",
      price: "₹0",
      period: "/ month",
      subtext: "Free forever",
      description: "Ideal for single-location cafes testing digital QR ordering.",
      features: [
        "5 Active Tables",
        "20 Menu Items",
        "Basic QR Ordering",
        "1 Staff Account",
      ],
      notIncluded: ["Kitchen Display System (KDS)", "Analytics & Reports"],
    },
    {
      tier: SubscriptionTier.BASIC,
      name: "BASIC",
      price: billingCycle === "annual" ? "₹399" : "₹499",
      period: "/ month + GST",
      subtext: billingCycle === "annual" ? "Billed ₹4,788 per year after trial" : "Billed monthly after trial",
      description: "Perfect for growing bistros needing live Kitchen Display (KDS).",
      features: [
        "15 Active Tables",
        "100 Menu Items",
        "Real-Time KDS Feed",
        "3 Staff Accounts",
        "Standard Analytics",
      ],
    },
    {
      tier: SubscriptionTier.PRO,
      name: "PRO",
      price: billingCycle === "annual" ? "₹1,599" : "₹1,999",
      period: "/ month + GST",
      subtext: billingCycle === "annual" ? "Billed ₹19,188 per year after trial" : "Billed monthly after trial",
      popular: true,
      description: "Our complete suite for busy restaurants scaling operations.",
      features: [
        "Unlimited Tables",
        "Unlimited Menu Items",
        "Advanced AI Revenue Analytics",
        "Unlimited Staff Roles",
        "Razorpay & Payment Gateway Integration",
        "Priority 24/7 Support",
      ],
    },
    {
      tier: SubscriptionTier.ENTERPRISE,
      name: "ENTERPRISE",
      price: "Custom",
      period: "",
      subtext: "Tailored quote",
      description: "Tailored for multi-branch chains & franchises.",
      features: [
        "Multi-Location Centralized POS",
        "Custom API Integrations",
        "Dedicated Account Manager",
        "Custom SLAs & Onsite Setup",
      ],
    },
  ];

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (tier === currentTier || tier === SubscriptionTier.FREE) return;
    await initiateCheckout(tier, billingCycle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-3xl font-extrabold text-white">Choose the Right Plan for OpsPortal</h2>
          <p className="mt-2 text-slate-400 text-sm">
            Every paid plan starts with a 14-day free trial. Scale your operations with zero risk.
          </p>

          <div className="inline-flex items-center bg-slate-950 border border-slate-800 p-1.5 rounded-full mt-6">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                billingCycle === "monthly" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                billingCycle === "annual" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Annual Billing <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full uppercase tracking-wider font-extrabold">Save 20%</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-400 bg-red-950/40 rounded-xl border border-red-800/60 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLAN_CARDS.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            const isFree = plan.tier === SubscriptionTier.FREE;

            return (
              <div
                key={plan.tier}
                className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 ${
                  plan.popular
                    ? "border-indigo-500 bg-indigo-950/20 shadow-xl ring-1 ring-indigo-500/30"
                    : "border-slate-800 bg-slate-950/60 shadow-sm hover:border-slate-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="my-4">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-xs font-medium text-slate-400 ml-1">{plan.period}</span>
                    <p className="text-[11px] text-slate-500 mt-1">{plan.subtext}</p>
                  </div>

                  <hr className="border-slate-800 my-4" />

                  <ul className="space-y-2 text-xs">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-slate-300">
                        <svg className="w-4 h-4 text-indigo-400 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded?.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-slate-500">
                        <svg className="w-4 h-4 text-slate-600 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleSelectPlan(plan.tier)}
                    disabled={isCurrent || isFree || subscribing}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition focus:outline-none ${
                      isCurrent
                        ? "bg-slate-800 text-slate-500 cursor-default border border-slate-700/50"
                        : isFree
                        ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800"
                        : plan.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95"
                        : "bg-slate-800 text-white hover:bg-slate-700 active:scale-95 border border-slate-700"
                    }`}
                  >
                    {subscribing ? "Processing..." : isCurrent ? "Active Plan" : isFree ? "Default Plan" : `Purchase ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}