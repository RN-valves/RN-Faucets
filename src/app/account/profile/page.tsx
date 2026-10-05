"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { getCustomerSession, setCustomerSession, clearCustomerSession, type CustomerSession } from "@/utils/customerAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Building2,
  FileSpreadsheet,
  MapPin,
  Save,
  Package,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [profession, setProfession] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const activeSession = getCustomerSession();
    if (!activeSession) {
      router.push("/login-user?redirect=/account/profile");
      return;
    }
    setSession(activeSession);
    setMobile(activeSession.mobile || "");

    // Fetch live user profile from server
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setMobile(data.user.mobile || "");
          setBusinessName(data.user.businessName || "");
          setGstNumber(data.user.gstNumber || "");
          setProfession(data.user.profession || "");
          setAddress(data.user.address || "");
          setCity(data.user.city || "");
          setState(data.user.state || "");
          setZipcode(data.user.zipcode || "");

          // Update local session
          const activeSession = getCustomerSession();
          if (activeSession) {
            setCustomerSession({
              ...activeSession,
              name: data.user.name,
              email: data.user.email,
              businessName: data.user.businessName,
              gstNumber: data.user.gstNumber,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Basic GST Validation if provided
    const cleanGst = gstNumber.trim().toUpperCase();
    if (cleanGst && cleanGst.length !== 15) {
      setErrorMsg("GST Number must be exactly 15 alphanumeric characters.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          businessName: businessName.trim(),
          gstNumber: cleanGst,
          profession: profession.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipcode: zipcode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile changes.");
      }

      setSuccessMsg("Your profile and GST details have been updated successfully!");
      if (session) {
        setCustomerSession({
          ...session,
          name: data.user?.name || name,
          email: data.user?.email || email,
          businessName: data.user?.businessName || businessName,
          gstNumber: data.user?.gstNumber || cleanGst,
          userType: data.user?.userType || session.userType,
        });
      }

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    clearCustomerSession();
    router.push("/login-user");
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl border border-red-100">
              {(name || session?.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{name || session?.name || "My Account"}</h1>
                {gstNumber && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                    <ShieldCheck size={12} /> GST Registered
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                <Phone size={13} className="text-slate-400" /> +91 {mobile || session?.mobile}
                {email && (
                  <>
                    <span>•</span>
                    <Mail size={13} className="text-slate-400" /> {email}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100 w-full sm:w-auto"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <Link
            href="/account/orders"
            className="pb-3 px-4 font-semibold text-sm text-slate-500 hover:text-slate-900 border-b-2 border-transparent transition-all flex items-center gap-2"
          >
            <Package size={16} /> My Orders
          </Link>
          <Link
            href="/account/profile"
            className="pb-3 px-4 font-bold text-sm text-red-600 border-b-2 border-red-600 transition-all flex items-center gap-2"
          >
            <User size={16} /> My Profile &amp; GST Details
          </Link>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 text-sm animate-in fade-in duration-200">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm animate-in fade-in duration-200">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Loader2 className="animate-spin text-red-600 mx-auto mb-3" size={28} />
            <p className="text-sm text-slate-500">Loading your profile details...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* 1. Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <User size={18} className="text-slate-700" />
                <h2 className="font-bold text-slate-900 text-base">Personal Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={mobile ? `+91 ${mobile}` : ""}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Registered phone number used for login &amp; OTP</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address (For Invoices &amp; Order Updates)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Tax invoices and tracking links will be automatically sent to this email.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. GST & Business Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-slate-700" />
                  <h2 className="font-bold text-slate-900 text-base">GST &amp; Business Details (For B2B Tax Invoices)</h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">Optional</span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    GST Number (GSTIN)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-mono font-bold text-slate-800 uppercase tracking-wider"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    15-digit GSTIN. Adding this will print your GST details on all order tax invoices.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Company / Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma Hardware &amp; Sanitary"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Official business name registered under your GST.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Address & Location Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <MapPin size={18} className="text-slate-700" />
                <h2 className="font-bold text-slate-900 text-base">Default Address Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Address Line
                  </label>
                  <input
                    type="text"
                    placeholder="House/Shop No., Street, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ghaziabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Uttar Pradesh"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 201010"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Profile &amp; GST Details
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <SupportLinksSection />
      <FooterSection />
    </div>
  );
}
