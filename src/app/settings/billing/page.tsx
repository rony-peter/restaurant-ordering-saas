"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Settings, Save, Info, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { previewBill, rupees } from "@/lib/billPreview";

// Keep these in line with the server (billing.settings.ts)
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const MAX_GST_RATE = 28;
const MAX_SERVICE_CHARGE = 20;
const SAMPLE_FOOD_PAISE = 100000; // the sample bill is built on Rs 1,000 of food

interface BillingSettings {
  gstRate: number;
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  gstin?: string;
}

const inputClass =
  "w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60";
const labelClass = "block text-xs font-semibold text-slate-300 mb-1.5";

function BillingSettingsContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<BillingSettings | null>(null); // what the server has
  const [gstRate, setGstRate] = useState("5");
  const [serviceEnabled, setServiceEnabled] = useState(false);
  const [servicePercent, setServicePercent] = useState("0");
  const [gstin, setGstin] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const applyToForm = (s: BillingSettings) => {
    setSaved(s);
    setGstRate(String(s.gstRate));
    setServiceEnabled(s.serviceChargeEnabled);
    setServicePercent(String(s.serviceChargePercent));
    setGstin(s.gstin ?? "");
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<BillingSettings>("/settings/billing");
      applyToForm(data);
    } catch (err: any) {
      setNotice({ type: "error", text: err?.response?.data?.message || "Couldn't load billing settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Numbers typed into the form, and what is wrong with them
  const parsed = useMemo(() => {
    const gst = gstRate.trim() === "" ? NaN : Number(gstRate);
    const sc = servicePercent.trim() === "" ? NaN : Number(servicePercent);
    const errors: { gst?: string; service?: string; gstin?: string } = {};
    const cleanGstin = gstin.trim().toUpperCase();

    if (!Number.isFinite(gst) || gst < 0 || gst > MAX_GST_RATE) {
      errors.gst = `Enter a rate between 0 and ${MAX_GST_RATE}.`;
    }
    if (serviceEnabled) {
      if (!Number.isFinite(sc) || sc <= 0 || sc > MAX_SERVICE_CHARGE) {
        errors.service = `Enter a percentage above 0 and up to ${MAX_SERVICE_CHARGE}, or turn service charge off.`;
      }
    }
    if (cleanGstin !== "" && !GSTIN_PATTERN.test(cleanGstin)) {
      errors.gstin = "Enter a valid 15-character GSTIN, or leave it empty.";
    }
    return { gst, sc: Number.isFinite(sc) ? sc : 0, cleanGstin, errors };
  }, [gstRate, servicePercent, serviceEnabled, gstin]);

  const hasErrors = Boolean(parsed.errors.gst || parsed.errors.service || parsed.errors.gstin);

  const dirty =
    !!saved &&
    (Number(gstRate) !== saved.gstRate ||
      parsed.cleanGstin !== (saved.gstin ?? "") ||
      serviceEnabled !== saved.serviceChargeEnabled ||
      (serviceEnabled && Number(servicePercent) !== saved.serviceChargePercent));

  // The sample bill uses the same maths as the server, so it matches what customers are charged
  const bill = useMemo(
    () =>
      previewBill(SAMPLE_FOOD_PAISE, {
        gstRate: Number.isFinite(parsed.gst) ? parsed.gst : 0,
        serviceChargeEnabled: serviceEnabled,
        serviceChargePercent: parsed.sc,
      }),
    [parsed, serviceEnabled]
  );

  const handleSave = async () => {
    if (hasErrors || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const body: Record<string, unknown> = {
        gstRate: parsed.gst,
        serviceChargeEnabled: serviceEnabled,
        gstin: parsed.cleanGstin,
      };
      if (serviceEnabled) body.serviceChargePercent = parsed.sc;

      const { data } = await api.put<{ message: string; settings: BillingSettings }>("/settings/billing", body);
      applyToForm(data.settings);
      setNotice({ type: "success", text: "Billing settings saved. New orders will use them." });
    } catch (err: any) {
      setNotice({ type: "error", text: err?.response?.data?.message || "Couldn't save the settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-slate-900 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-400" /> Billing & Tax Settings
            </h1>
            <p className="text-sm text-slate-400 mt-1">Set your GST rate and an optional service charge.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!dirty || hasErrors || saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Tax</h2>
              <label htmlFor="gst" className={labelClass}>GST Rate (%)</label>
              <input
                id="gst"
                type="number"
                inputMode="decimal"
                min={0}
                max={MAX_GST_RATE}
                step="0.01"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className={inputClass}
              />
              {parsed.errors.gst ? (
                <p className="text-xs text-red-400 mt-1.5">{parsed.errors.gst}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">
                  Split equally into CGST and SGST. Enter 0 if GST is not applicable.
                </p>
              )}

              <label htmlFor="gstin" className={`${labelClass} mt-4`}>GSTIN</label>
              <input
                id="gstin"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="29ABCDE1234F1Z5"
                maxLength={15}
                className={`${inputClass} uppercase`}
              />
              {parsed.errors.gstin ? (
                <p className="text-xs text-red-400 mt-1.5">{parsed.errors.gstin}</p>
              ) : parsed.gst > 0 && parsed.cleanGstin === "" ? (
                <p className="text-xs text-amber-400 mt-1.5">
                  You are charging GST without a GSTIN. Add your GSTIN so bills show as tax invoices, or set the
                  rate to 0 if you are not registered for GST.
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">Printed on your bills. Leave empty if you are not registered.</p>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Service Charge</h2>
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <span>
                  <span className="block text-sm font-semibold">Add a service charge to bills</span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Optional. A customer can ask for it to be removed.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={serviceEnabled}
                  onChange={(e) => setServiceEnabled(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-indigo-500"
                />
              </label>

              {serviceEnabled && (
                <div className="mt-4">
                  <label htmlFor="sc" className={labelClass}>Service Charge (%)</label>
                  <input
                    id="sc"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={MAX_SERVICE_CHARGE}
                    step="0.01"
                    value={servicePercent}
                    onChange={(e) => setServicePercent(e.target.value)}
                    className={inputClass}
                  />
                  {parsed.errors.service && <p className="text-xs text-red-400 mt-1.5">{parsed.errors.service}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Sample bill */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl h-fit">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-indigo-400" /> Sample Bill (₹1,000 of food)
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-sm space-y-2">
              <Row label="Food subtotal" value={rupees(bill.foodPaise)} />
              {bill.serviceChargePaise > 0 && (
                <Row label={`Service charge (${parsed.sc}%)`} value={rupees(bill.serviceChargePaise)} />
              )}
              {bill.totalTaxPaise > 0 ? (
                <>
                  <Row label={`CGST (${(parsed.gst / 2).toString()}%)`} value={rupees(bill.cgstPaise)} />
                  <Row label={`SGST (${(parsed.gst / 2).toString()}%)`} value={rupees(bill.sgstPaise)} />
                </>
              ) : (
                <Row label="GST" value="Not charged" />
              )}
              {bill.roundOffPaise !== 0 && (
                <Row
                  label="Round off"
                  value={`${bill.roundOffPaise > 0 ? "+" : "-"} ${rupees(Math.abs(bill.roundOffPaise))}`}
                />
              )}
              <div className="pt-3 mt-2 border-t border-slate-700 flex justify-between font-bold text-white">
                <span>Grand total</span>
                <span>{rupees(bill.grandTotalPaise)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              GST is charged on the food plus the service charge, and the total is rounded to the nearest rupee.
              This is exactly how customers are billed. Alcohol items are not charged GST.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-300">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function BillingSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <BillingSettingsContent />
    </ProtectedRoute>
  );
}