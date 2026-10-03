import React from "react";
import { SubscriptionTier } from "@/types/subscription";
import { useSubscription } from "../hooks/useSubscription";

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlanDetails {
  tier: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
  features: string[];
  notIncluded?: string[];
}

const PLAN_CARDS: PlanDetails[] = [
  {
    tier: SubscriptionTier.FREE,
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Essential tools for small food stalls or testing out OpsPortal.",
    features: [
      "Up to 3 Tables",
      "1 Staff Account",
      "Up to 15 Menu Items",
      "Standard QR Code Ordering",
    ],
    notIncluded: ["Kitchen Display System (KDS)", "Analytics & Reports"],
  },
  {
    tier: SubscriptionTier.BASIC,
    name: "Basic",
    price: "₹999",
    period: "/month",
    description: "Ideal for small cafes and quick-service diners needing kitchen sync.",
    features: [
      "Up to 10 Tables",
      "3 Staff Accounts",
      "Up to 45 Menu Items",
      "Kitchen Display System (KDS)",
      "Standard QR Code Ordering",
    ],
    notIncluded: ["Analytics & Reports"],
  },
  {
    tier: SubscriptionTier.PRO,
    name: "Pro",
    price: "₹2,499",
    period: "/month",
    description: "Designed for busy restaurants requiring real-time KDS and analytics.",
    popular: true,
    features: [
      "Up to 30 Tables",
      "10 Staff Accounts",
      "Up to 120 Menu Items",
      "Kitchen Display System (KDS)",
      "Advanced Analytics & Sales Insights",
      "Priority Email & Chat Support",
    ],
  },
  {
    tier: SubscriptionTier.ENTERPRISE,
    name: "Enterprise",
    price: "₹4,999",
    period: "/month",
    description: "Uncapped scale and full feature access for high-volume dining.",
    features: [
      "Unlimited Tables",
      "Unlimited Staff Accounts",
      "Unlimited Menu Items",
      "Kitchen Display System (KDS)",
      "Advanced Analytics & Sales Insights",
      "24/7 Priority Support",
    ],
  },
];

export function SubscriptionPlansModal({ isOpen, onClose }: SubscriptionPlansModalProps) {
  const { subscription, initiateCheckout, subscribing, error } = useSubscription();

  if (!isOpen) return null;

  const currentTier = subscription?.tier || SubscriptionTier.FREE;

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (tier === currentTier || tier === SubscriptionTier.FREE) return;
    await initiateCheckout(tier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-white">Choose the Right Plan for OpsPortal</h2>
          <p className="mt-2 text-slate-400 text-sm">
            Scale your tables, kitchen ops, and staff capacity smoothly. Upgrade or change your tier at any time.
          </p>
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
                    : "border-slate-800 bg-slate-800/40 shadow-sm hover:border-slate-700"
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {plan.popular && (
                    <span className="bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      Most Popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      Current Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mt-2">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm font-medium text-slate-400">{plan.period}</span>
                  </div>

                  <hr className="border-slate-800 my-4" />

                  <ul className="space-y-2.5 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-slate-300">
                        <svg className="w-5 h-5 text-indigo-400 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}

                    {plan.notIncluded?.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-slate-500">
                        <svg className="w-5 h-5 text-slate-600 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isCurrent
                        ? "bg-slate-800 text-slate-500 cursor-default border border-slate-700/50"
                        : isFree
                        ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800"
                        : plan.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95"
                        : "bg-slate-100 text-slate-900 hover:bg-white active:scale-95"
                    }`}
                  >
                    {subscribing ? "Processing..." : isCurrent ? "Active Plan" : isFree ? "Default Tier" : `Upgrade to ${plan.name}`}
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