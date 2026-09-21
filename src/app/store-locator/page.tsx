"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import {
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  Building2,
  Compass,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const UPCOMING_REGIONS = [
  {
    city: "Delhi NCR",
    state: "Delhi & Haryana",
    hub: "Chawri Bazar Experience Studio",
    dealers: "180+ Authorized Dealers",
    status: "Launching Soon",
  },
  {
    city: "Mumbai & Pune",
    state: "Maharashtra",
    hub: "Western India Display Gallery",
    dealers: "140+ Partner Showrooms",
    status: "Launching Soon",
  },
  {
    city: "Ahmedabad & Surat",
    state: "Gujarat",
    hub: "Gujarat Trade Experience Studio",
    dealers: "120+ Retail Partners",
    status: "Launching Soon",
  },
  {
    city: "Bengaluru & Hyderabad",
    state: "Karnataka & Telangana",
    hub: "South Regional Display Studio",
    dealers: "95+ Exclusive Counters",
    status: "Launching Soon",
  },
  {
    city: "Chandigarh & Ludhiana",
    state: "Punjab & Haryana",
    hub: "North Zone Architectural Hub",
    dealers: "110+ Authorized Stores",
    status: "Launching Soon",
  },
  {
    city: "Lucknow & Kanpur",
    state: "Uttar Pradesh",
    hub: "Central UP Distribution Display",
    dealers: "160+ Plumbing Counters",
    status: "Launching Soon",
  },
];

export default function UserStoreLocatorPage() {
  const [inquiryCity, setInquiryCity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryCity.trim()) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] flex flex-col font-sans text-slate-900">
      <Header />

      {/* ── HERO BANNER (Coming Soon) ── */}
      <section
        data-header-theme="light"
        className="w-full pt-[140px] pb-[80px] px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center"
      >
        {/* Coming Soon Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold tracking-wider uppercase mb-6 shadow-sm">
          <Sparkles size={14} className="text-amber-600 animate-pulse" />
          <span>Interactive Store Locator • Coming Soon</span>
        </div>

        {/* Heading */}
        <span className="block font-sans text-lg md:text-xl font-medium text-slate-500 tracking-tight mb-2">
          Touch, Feel & Experience Pure Craftsmanship
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] max-w-4xl mb-6">
          RN Experience Studios &amp; Authorized Showrooms
        </h1>

        <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-10">
          We are currently integrating live GPS mapping for our nationwide network of over{" "}
          <strong className="text-slate-900 font-semibold">1,200+ authorized dealers</strong>, flagship experience centers, and trade partners across India.
        </p>

        {/* Action Buttons for immediate store assistance */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md">
          <a
            href="https://wa.me/918737029643?text=Hi%20RN%20Valves,%20please%20help%20me%20find%20an%20authorized%20store%20near%20my%20city."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <MessageCircle size={18} />
            <span>Find Nearby Store on WhatsApp</span>
          </a>

          <Link
            href="/contact-us"
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <span>Request Store Details</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── STATS / TRUST HIGHLIGHTS ── */}
      <section className="w-full bg-slate-50 border-y border-slate-200/80 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">1,200+</div>
            <div className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Authorized Counters
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">28+</div>
            <div className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">
              States &amp; UTs Covered
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">100%</div>
            <div className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Genuine Warranty
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">24-48h</div>
            <div className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">
              On-Site Support
            </div>
          </div>
        </div>
      </section>

      {/* ── NATIONWIDE NETWORK ROADMAP PREVIEW ── */}
      <section className="w-full py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              <Compass size={15} className="text-sky-600" />
              <span>Network Rollout</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Major Hubs &amp; Experience Studio Network
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Our upcoming GPS locator will allow you to enter your pincode, view 3D showroom galleries, and get direct directions to certified RN display points.
          </p>
        </div>

        {/* Region Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UPCOMING_REGIONS.map((region) => (
            <div
              key={region.city}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock size={12} />
                    {region.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {region.state}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-sky-700 transition">
                  <MapPin size={18} className="text-sky-600 flex-shrink-0" />
                  {region.city}
                </h3>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-800">{region.hub}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>{region.dealers}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Live GPS Mapping
                </span>
                <a
                  href={`https://wa.me/918737029643?text=Hi%20RN%20Valves,%20I%20want%20to%20visit%20an%20authorized%20store%20in%20${encodeURIComponent(region.city)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-700 transition"
                >
                  <span>Locate via WhatsApp</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NOTIFICATION & INQUIRY FORM BOX ── */}
      <section className="w-full py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold tracking-wider uppercase border border-white/10">
            <MapPin size={13} className="text-sky-400" />
            <span>Looking for an Immediate Dealer?</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Need Showroom Location in Your City Right Now?
          </h2>

          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Send us your city or pincode. Our customer executive will immediately share the address and phone number of the nearest authorized dealer.
          </p>

          {!submitted ? (
            <form onSubmit={handleNotifySubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                required
                value={inquiryCity}
                onChange={(e) => setInquiryCity(e.target.value)}
                placeholder="Enter your City or Pincode (e.g. Pune / 110006)..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm rounded-xl transition shadow"
              >
                Send Request
              </button>
            </form>
          ) : (
            <div className="max-w-md mx-auto p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span>Thank you! We received your request for <strong>{inquiryCity}</strong>. Our team will contact you.</span>
            </div>
          )}

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Phone size={14} className="text-sky-400" />
              Customer Helpline: <strong className="text-white">+91 87370 29643</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={14} className="text-emerald-400" />
              WhatsApp Support: <strong className="text-white">+91 87370 29643</strong>
            </span>
          </div>
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
