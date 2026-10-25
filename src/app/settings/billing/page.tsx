"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, AlertCircle } from "lucide-react";

export default function BillingSettingsPage() {
  const [taxMode, setTaxMode] = useState<"gst" | "composition">("gst");
  const [gstRate, setGstRate] = useState<number>(5);
  const [gstin, setGstin] = useState("");
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(false);
  const [serviceChargePercent, setServiceChargePercent] = useState<number>(5);
  const [gstOnServiceCharge, setGstOnServiceCharge] = useState(true);
  const [packagingCharge, setPackagingCharge] = useState<number>(20);
  const [roundOffEnabled, setRoundOffEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/api/settings/billing", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.taxMode) setTaxMode(data.taxMode);
          if (data.gstRate !== undefined) {
            const rateVal = data.gstRate <= 1 ? data.gstRate * 100 : data.gstRate;
            setGstRate(rateVal);
          }
          if (data.gstin) setGstin(data.gstin);
          if (data.serviceChargeEnabled !== undefined) setServiceChargeEnabled(data.serviceChargeEnabled);
          if (data.serviceChargePercent !== undefined) setServiceChargePercent(data.serviceChargePercent);
          if (data.gstOnServiceCharge !== undefined) setGstOnServiceCharge(data.gstOnServiceCharge);
          if (data.packagingChargePaise !== undefined) setPackagingCharge(data.packagingChargePaise / 100);
          if (data.roundOffEnabled !== undefined) setRoundOffEnabled(data.roundOffEnabled);
        }
      } catch (err) {
        console.error("Failed to load billing settings", err);
      }
    }
    fetchSettings();
  }, []);

  const sampleFoodSubtotal = 1000;
  const sampleServiceCharge = serviceChargeEnabled ? (sampleFoodSubtotal * serviceChargePercent) / 100 : 0;
  const sampleGstBase = sampleFoodSubtotal + (gstOnServiceCharge ? sampleServiceCharge : 0) + packagingCharge;
  const sampleTax = taxMode === "gst" ? (sampleGstBase * gstRate) / 100 : 0;
  const sampleTotal = sampleFoodSubtotal + sampleServiceCharge + packagingCharge + sampleTax;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/settings/billing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taxMode,
          gstRate,
          gstin,
          serviceChargeEnabled,
          serviceChargePercent,
          gstOnServiceCharge,
          packagingChargePaise: packagingCharge * 100,
          roundOffEnabled,
        }),
      });

      if (!res.ok) throw new Error("Failed to save billing settings");
      setMessage("Billing settings updated successfully.");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-white">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-400" /> Billing & Tax Settings</h1>
          <p className="text-sm text-slate-400">Configure tax modes, GST rates, service charges, and live receipt rules.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-lg font-bold">Tax Configuration</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tax Mode</label>
            <select value={taxMode} onChange={(e) => setTaxMode(e.target.value as any)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white">
              <option value="gst">Regular GST</option>
              <option value="composition">Composition Scheme (Bill of Supply)</option>
            </select>
          </div>

          {taxMode === "gst" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GST Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  value={gstRate} 
                  onChange={(e) => setGstRate(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" 
                />
                <p className="text-xs text-slate-500 mt-1">Set to 0 if GST is not applicable.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN</label>
                <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="29ABCDE1234F1Z5" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white uppercase" />
              </div>
            </>
          )}

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-lg font-bold">Additional Charges</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Service Charge</p>
                <p className="text-xs text-slate-400">Add automatic service charge to dine-in orders</p>
              </div>
              <input type="checkbox" checked={serviceChargeEnabled} onChange={(e) => setServiceChargeEnabled(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-indigo-600 w-5 h-5" />
            </div>

            {serviceChargeEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Service Charge (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    value={serviceChargePercent} 
                    onChange={(e) => setServiceChargePercent(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" 
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input type="checkbox" id="gstOnSc" checked={gstOnServiceCharge} onChange={(e) => setGstOnServiceCharge(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-indigo-600 mr-2" />
                  <label htmlFor="gstOnSc" className="text-xs text-slate-300">Apply GST on Service Charge</label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Packaging Charge (₹)</label>
              <input 
                type="number" 
                min="0"
                value={packagingCharge} 
                onChange={(e) => setPackagingCharge(e.target.value === "" ? 0 : parseFloat(e.target.value))} 
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" 
              />
            </div>
          </div>
        </div>

        {/* Live Sample Bill Preview */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5 text-indigo-400" /> Live Sample Bill Preview (₹1,000 Food)</h2>
          <div className="bg-slate-950 p-6 rounded-xl space-y-3 font-mono text-sm border border-slate-800">
            <div className="flex justify-between text-slate-400"><span>Food Subtotal</span><span>₹1,000.00</span></div>
            {serviceChargeEnabled && <div className="flex justify-between text-slate-400"><span>Service Charge ({serviceChargePercent}%)</span><span>₹{sampleServiceCharge.toFixed(2)}</span></div>}
            <div className="flex justify-between text-slate-400"><span>Packaging Charge</span><span>₹{packagingCharge.toFixed(2)}</span></div>
            {taxMode === "gst" && <div className="flex justify-between text-slate-400"><span>GST ({gstRate}%)</span><span>₹{sampleTax.toFixed(2)}</span></div>}
            <div className="border-t border-slate-800 pt-3 flex justify-between font-bold text-white text-base"><span>Grand Total</span><span>₹{sampleTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}