"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { Store, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [gstRate, setGstRate] = useState("5");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consentTnc, setConsentTnc] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentTnc) {
      setError("You must agree to the Privacy Policy and Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      const parsedGstRate = gstRate === "" ? 0 : parseFloat(gstRate);

      const response = await AuthService.registerAdmin({
        restaurantName,
        address: `${addressLine}, ${city}, ${stateName} - ${pincode}`,
        phone: `+91${phone}`,
        gstin,
        taxRate: parsedGstRate / 100,
        email: adminEmail,
        password: adminPassword,
        consentTnc,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.staff));
      router.push("/orders");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-semibold mb-3">
            <Store className="w-3.5 h-3.5" /> 14-day free trial. No payment needed.
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Register Your Restaurant</h1>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Restaurant Profile & Tax</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Restaurant Name *</label>
              <input type="text" required value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" placeholder="Spice Route Bistro" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GST Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0"
                  value={gstRate} 
                  onChange={(e) => setGstRate(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" 
                  placeholder="5"
                />
                <p className="text-xs text-slate-500 mt-1">Enter 0 if GST is not applicable.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN (Optional)</label>
                <input type="text" placeholder="29ABCDE1234F1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white uppercase" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Indian Mobile Number (+91)</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-slate-700 border border-r-0 border-slate-600 rounded-l-xl text-sm text-slate-300">+91</span>
                <input type="text" maxLength={10} placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-r-xl text-sm text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Street Address" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" />
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" />
              <input type="text" placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" />
              <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Primary Owner / Admin Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="email" required placeholder="admin@restaurant.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required placeholder="Password (min 8 chars)" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="consent" checked={consentTnc} onChange={(e) => setConsentTnc(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-indigo-600" />
            <label htmlFor="consent" className="text-xs text-slate-300">I agree to the Privacy Policy and Terms of Service.</label>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-colors shadow-lg">
            {loading ? "Registering..." : "Complete Registration & Launch"}
          </button>
        </form>
      </div>
    </div>
  );
}