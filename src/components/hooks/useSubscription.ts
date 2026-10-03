"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api"; // Updated to named import
import { CurrentSubscriptionResponse, SubscriptionTier, CheckoutResponse } from "@/types/subscription";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<CurrentSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscribing, setSubscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<CurrentSubscriptionResponse>("/subscriptions/current");
      setSubscription(response.data);
    } catch (err: any) {
      console.error("Failed to fetch subscription:", err);
      setError(err.response?.data?.message || "Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const initiateCheckout = async (tier: SubscriptionTier) => {
    try {
      setSubscribing(true);
      setError(null);

      const { data } = await api.post<CheckoutResponse>("/subscriptions/checkout", { tier });

      const options = {
        key: data.keyId,
        subscription_id: data.razorpaySubscriptionId,
        name: "OpsPortal Subscription",
        description: `Upgrade plan to ${tier}`,
        handler: async function (response: any) {
          try {
            await api.post("/subscriptions/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            await fetchSubscription();
            alert("Subscription upgraded successfully!");
          } catch (verifyErr: any) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            setSubscribing(false);
          },
        },
        theme: {
          color: "#4f46e5",
        },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setError("Razorpay SDK not loaded. Please refresh script.");
      }
    } catch (err: any) {
      console.error("Checkout initiation error:", err);
      setError(err.response?.data?.message || "Failed to initiate subscription process.");
    } finally {
      setSubscribing(false);
    }
  };

  return {
    subscription,
    loading,
    subscribing,
    error,
    refetch: fetchSubscription,
    initiateCheckout,
  };
}