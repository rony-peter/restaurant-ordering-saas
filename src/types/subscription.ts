export enum SubscriptionTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export enum SubscriptionStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  HALTED = "HALTED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface SubscriptionLimits {
  maxTables: number;
  maxStaff: number;
  maxMenuItems: number;
  hasAnalytics: boolean;
  hasKds: boolean;
}

export interface SubscriptionUsage {
  tablesCount: number;
  staffCount: number;
  menuItemsCount: number;
}

export interface CurrentSubscriptionResponse {
  id: string;
  restaurantId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  razorpaySubscriptionId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
}

export interface CheckoutResponse {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  keyId: string;
}