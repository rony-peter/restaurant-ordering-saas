"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Copy, Check, ShieldCheck, AlertTriangle, RefreshCw, Eye, EyeOff, Unplug } from "lucide-react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface PaymentConfig {
  configured: boolean;
  keyId?: string;
  mode?: "test" | "live";
  isActive?: boolean;
  webhookUrl?: string;
  webhookSecret?: string; // only returned right after saving
}

interface PlanInfo {
  tier: string;
  status: string;
  limits?: { hasOnlinePayments?: boolean };
}

const inputClass =
  "w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelClass = "block text-xs font-semibold text-slate-300 mb-1.5";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the value can still be selected by hand
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2">
        <input readOnly value={value} className={`${inputClass} font-mono text-xs`} onFocus={(e) => e.currentTarget.select()} />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 transition"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function PaymentsContent() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PaymentConfig>({ configured: false });
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cfg, sub] = await Promise.all([
          api.get<PaymentConfig>("/payments/config"),
          api.get<PlanInfo>("/subscriptions/current"),
        ]);
        setConfig(cfg.data);
        setPlan(sub.data);
        if (cfg.data.keyId) setKeyId(cfg.data.keyId);
      } catch (err: any) {
        setNotice({ type: "error", text: err?.response?.data?.message || "Couldn't load payment settings." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const planAllows = plan?.limits?.hasOnlinePayments === true && plan?.status === "ACTIVE";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const { data } = await api.put<PaymentConfig>("/payments/config", {
        keyId: keyId.trim(),
        keySecret: keySecret.trim(),
      });
      setConfig(data);
      setWebhookSecret(data.webhookSecret ?? null);
      setKeySecret(""); // the secret is not kept in the page after it is saved
      setNotice({ type: "success", text: "Your Razorpay account is connected." });
    } catch (err: any) {
      setNotice({ type: "error", text: err?.response?.data?.message || "Couldn't save the keys." });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Disconnect Razorpay? Customers will no longer be able to pay online.")) return;
    setRemoving(true);
    setNotice(null);
    try {
      await api.delete("/payments/config");
      setConfig({ configured: false });
      setWebhookSecret(null);
      setKeyId("");
      setKeySecret("");
      setNotice({ type: "success", text: "Razorpay disconnected. Customers can still pay at the table." });
    } catch (err: any) {
      setNotice({ type: "error", text: err?.response?.data?.message || "Couldn't disconnect." });
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-slate-900 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const urlIsComplete = config.webhookUrl?.startsWith("http");

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" /> Online Payments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect your own Razorpay account. Customer payments go straight to it.
          </p>
        </div>

        {notice && (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className={`p-4 text-sm rounded-xl border ${
              notice.type === "success"
                ? "text-emerald-300 bg-emerald-950/40 border-emerald-800/60"
                : "text-red-400 bg-red-950/40 border-red-800/60"
            }`}
          >
            {notice.text}
          </div>
        )}

        {!planAllows && (
          <div className="p-4 text-sm text-amber-200 bg-amber-950/30 border border-amber-800/60 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <span>
              Online payments are part of the Pro plan. You can connect Razorpay now, but customers will only see the
              online option once your plan includes it.{" "}
              <Link href="/settings/subscription" className="underline font-semibold">
                View plans
              </Link>
            </span>
          </div>
        )}

        {config.configured && (
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-semibold">Razorpay connected</p>
                <p className="text-xs text-slate-400 font-mono">{config.keyId}</p>
              </div>
              <span
                className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full border ${
                  config.mode === "live"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}
              >
                {config.mode === "live" ? "Live: real money" : "Test mode"}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={removing}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-300 border border-red-800/60 rounded-xl hover:bg-red-950/40 transition disabled:opacity-50"
            >
              <Unplug className="w-4 h-4" /> {removing ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-5">
          <h2 className="text-lg font-semibold">{config.configured ? "Update your keys" : "Connect Razorpay"}</h2>
          <p className="text-xs text-slate-400">
            In your Razorpay dashboard open <b>Account & Settings, then API Keys</b>, and generate a key. Use{" "}
            <b>test keys</b> (they start with <span className="font-mono">rzp_test_</span>) until you have tried a full
            order. The secret is stored encrypted and is never shown again.
          </p>

          <div>
            <label htmlFor="keyId" className={labelClass}>Key ID</label>
            <input
              id="keyId"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              placeholder="rzp_test_..."
              autoComplete="off"
              required
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label htmlFor="keySecret" className={labelClass}>Key Secret</label>
            <div className="relative">
              <input
                id="keySecret"
                type={showSecret ? "text" : "password"}
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                autoComplete="new-password"
                required
                className={`${inputClass} font-mono pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label={showSecret ? "Hide secret" : "Show secret"}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !keyId.trim() || !keySecret.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            {saving ? "Checking with Razorpay..." : config.configured ? "Save new keys" : "Connect Razorpay"}
          </button>
        </form>

        {config.configured && (
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-5">
            <h2 className="text-lg font-semibold">Confirm payments automatically (recommended)</h2>
            <p className="text-xs text-slate-400">
              Payments are confirmed when the customer&rsquo;s phone reports success. A webhook also confirms them if the
              customer closes the page right after paying. Set it up once in Razorpay:
            </p>

            <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
              <li>Open Razorpay, then Account & Settings, then Webhooks, and click Add New Webhook.</li>
              <li>Paste the webhook URL and the secret below.</li>
              <li>
                Tick the events <span className="font-mono text-xs">payment.captured</span> and{" "}
                <span className="font-mono text-xs">payment.failed</span>, then save.
              </li>
            </ol>

            {config.webhookUrl && <CopyField label="Webhook URL" value={config.webhookUrl} />}
            {!urlIsComplete && (
              <p className="text-xs text-amber-400">
                This address is incomplete because the server&rsquo;s API_PUBLIC_URL is not set. Razorpay needs a full public https address.
              </p>
            )}

            {webhookSecret ? (
              <CopyField label="Webhook secret" value={webhookSecret} />
            ) : (
              <p className="text-xs text-slate-500">
                The webhook secret is shown right after you save your keys. If you need it again, save your keys again
                and it will be displayed.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentsSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <PaymentsContent />
    </ProtectedRoute>
  );
}