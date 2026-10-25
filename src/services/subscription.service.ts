import { SubscriptionTier, CurrentSubscriptionResponse, CheckoutResponse } from "@/types/subscription";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const SubscriptionService = {
  async getCurrentSubscription(token: string): Promise<CurrentSubscriptionResponse> {
    const res = await fetch(`${API_BASE_URL}/subscriptions/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch subscription details.");
    return res.json();
  },

  async initiateCheckout(token: string, tier: SubscriptionTier, billingCycle: "monthly" | "annual" = "monthly"): Promise<CheckoutResponse> {
    const res = await fetch(`${API_BASE_URL}/subscriptions/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tier, billingCycle }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to initialize checkout.");
    }
    return res.json();
  },

  async verifyPayment(token: string, paymentData: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/subscriptions/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) throw new Error("Payment verification failed.");
    return res.json();
  },
};