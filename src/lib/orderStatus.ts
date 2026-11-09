// Mirrors the backend rules (order.rules.ts) so the dashboard only offers moves the server will accept.
// The server is still the final judge.

export const KITCHEN_STATUSES = ["PLACED", "ACCEPTED", "PREPARING", "READY"];

const FLOW = ["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED", "PAID", "COMPLETED"];
const PAID_INDEX = FLOW.indexOf("PAID");

interface Options {
  paymentMethod?: string; // "ONLINE" | "PAY_AT_TABLE"
  paymentStatus?: string; // status of the latest payment
}

/** Statuses an order can be moved to from `current`. The current status is always listed first. */
export function allowedStatuses(current: string, opts: Options = {}): string[] {
  if (current === "COMPLETED" || current === "CANCELLED") return [current];

  const index = FLOW.indexOf(current);
  if (index === -1) return [current];

  const paidOnline = opts.paymentMethod === "ONLINE" && opts.paymentStatus === "COMPLETED";
  const waitingOnline = opts.paymentMethod === "ONLINE" && !paidOnline;

  const forward = FLOW.slice(index + 1).filter((s) => !(s === "PAID" && waitingOnline));
  const result = [current, ...forward];

  if (index < PAID_INDEX && !paidOnline) result.push("CANCELLED");
  return result;
}

export const formatRupees = (paise: number | null | undefined) =>
  typeof paise === "number" ? `₹${(paise / 100).toFixed(2)}` : "-";