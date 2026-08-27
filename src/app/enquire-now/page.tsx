"use client";

import { useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { Send, Phone, Mail, MapPin, CheckCircle2, Building2, Sparkles } from "lucide-react";

export default function UserEnquiryPage() {
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    subject: "Bulk Dealership & Trade Inquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.customerName || !form.email || !form.phone) {
      setErrorMsg("Please fill out your name, email, and phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        setForm({
          customerName: "",
          email: "",
          phone: "",
          subject: "Bulk Dealership & Trade Inquiry",
          message: "",
        });
      } else {
        setErrorMsg("Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] flex flex-col font-sans text-slate-900">
      <Header />

      <section data-header-theme="light" className="w-full pt-[130px] pb-[80px] px-4 max-w-5xl mx-auto space-y-8">
        {/* Banner Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded-full uppercase tracking-wider">
            B2B Trade & Dealership Portal
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Enquire Now & Partner With Us
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Interested in becoming an authorized distributor, dealer, or sourcing for architectural projects? Submit your details below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Panel */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-extrabold text-white">Corporate Office</h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">RN Valves & Faucets</p>
                    <p>B-68 SITE-4 SAHIBABAD, Ghaziabad, Uttar Pradesh 201010, India</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">Toll-Free Helpline</p>
                    <a href="tel:18002120192" className="hover:text-amber-300">1800 212 0192</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">B2B Trade Support</p>
                    <a href="mailto:info@rnvalves.com" className="hover:text-amber-300">info@rnvalves.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/15 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white flex items-center gap-1">
                <Building2 size={14} className="text-amber-400" />
                Distributor Network
              </p>
              <p>Over 890+ authorized trade partners across 28 states in India.</p>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl space-y-5">
            {submittedSuccess ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
                <h3 className="text-xl font-extrabold text-emerald-900">Enquiry Submitted Successfully!</h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Thank you for reaching out to RN Valves & Faucets. Our B2B trade representative will contact you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Your Full Name / Firm Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh@sharmahardware.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Inquiry Purpose</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="Bulk Dealership & Trade Inquiry">Bulk Dealership & Trade Inquiry</option>
                    <option value="Architectural Project Sourcing">Architectural Project Sourcing</option>
                    <option value="Product Technical & Warranty Support">Product Technical & Warranty Support</option>
                    <option value="General Consumer Query">General Consumer Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Message & Requirements</label>
                  <textarea
                    rows={4}
                    placeholder="Write your product requirements, required quantity, or trade query details..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {loading ? "Submitting Inquiry..." : "Submit Inquiry to Trade Team"}
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
