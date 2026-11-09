"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  CurrentSubscriptionResponse,
  SubscriptionTier,
  SubscriptionStatus,
  CheckoutResponse,
  VerifyResponse,
} from "@/types/subscription";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Loads the Razorpay popup script on demand, so no <script> tag is needed in the layout. */
function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => resolve(false));
    if (!existing) {
      script.src = CHECKOUT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** After a payment, asks the server to re-check Razorpay until the plan shows as active. */
async function waitUntilActive(): Promise<boolean> {
  for (let i = 0; i < 10; i++) {
    try {
      const { data } = await api.post<VerifyResponse>("/subscriptions/sync");
      const sub = data.subscription;
      if (sub.tier !== SubscriptionTier.FREE && sub.status === SubscriptionStatus.ACTIVE) return true;
    } catch {
      // keep trying
    }
    await sleep(2000);
  }
  return false;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<CurrentSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null); // problems loading the plan
  const [error, setError] = useState<string | null>(null); // problems with an action (pay, cancel)
  const [notice, setNotice] = useState<string | null>(null); // success messages

  const fetchSubscription = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setLoadError(null);
      const response = await api.get<CurrentSubscriptionResponse>("/subscriptions/current");
      setSubscription(response.data);
    } catch (err: any) {
      console.error("Failed to fetch subscription:", err);
      setLoadError(err.response?.data?.message || "Failed to load subscription details.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const initiateCheckout = async (tier: SubscriptionTier, billingCycle: "monthly" | "annual" = "monthly") => {
    if (subscribing) return; // blocks double clicks, which would create duplicate subscriptions
    setSubscribing(true);
    setError(null);
    setNotice(null);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Couldn't load the payment window. Check your connection and try again.");

      const { data } = await api.post<CheckoutResponse>("/subscriptions/checkout", { tier, billingCycle });

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.razorpaySubscriptionId,
        name: "OpsPortal",
        description: `${tier} plan (${billingCycle})`,
        handler: async (response: any) => {
          try {
            const { data: result } = await api.post<VerifyResponse>("/subscriptions/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            const active = result.activated || (await waitUntilActive());
            await fetchSubscription(true);
            setNotice(
              active
                ? "Your plan is now active."
                : "Payment received. Your plan will activate in a moment. Refresh this page shortly."
            );
          } catch (e: any) {
            setError(
              e.response?.data?.message ||
                "We couldn't confirm your payment. If you were charged, please contact support."
            );
          } finally {
            setSubscribing(false);
          }
        },
        modal: { ondismiss: () => setSubscribing(false) },
        theme: { color: "#4f46e5" },
      });

      rzp.on("payment.failed", (resp: any) => {
        setError(resp?.error?.description || "Payment failed. Please try again.");
        setSubscribing(false);
      });

      rzp.open(); // does not wait, so "subscribing" stays true until the popup finishes or closes
    } catch (err: any) {
      console.error("Checkout initiation error:", err);
      setError(err.response?.data?.message || err.message || "Failed to start the subscription.");
      setSubscribing(false);
    }
  };

  const cancelSubscription = async () => {
    setCancelling(true);
    setError(null);
    setNotice(null);
    try {
      await api.post("/subscriptions/cancel");
      await fetchSubscription(true);
      setNotice("Your plan will end when the current billing period finishes.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel the plan.");
    } finally {
      setCancelling(false);
    }
  };

  return {
    subscription,
    loading,
    subscribing,
    cancelling,
    loadError,
    error,
    notice,
    refetch: fetchSubscription,
    initiateCheckout,
    cancelSubscription,
  };
}

export type SubscriptionApi = ReturnType<typeof useSubscription>;