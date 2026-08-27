"use client";

import { useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { MapPin, Search, Phone, Navigation, Building2, ExternalLink } from "lucide-react";

interface Showroom {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  type: "Authorized Flagship Showroom" | "Exclusive Trade Dealer";
}

const MOCK_SHOWROOMS: Showroom[] = [
  {
    id: "show-1",
    name: "RN Valves Experience Center - Chawri Bazar",
    address: "3224 & 3227, Hakim Baka Street, near Chaumukha Mandir, Chawri Bazar",
    city: "Delhi",
    state: "Delhi",
    pinCode: "110006",
    phone: "011-23261234",
    type: "Authorized Flagship Showroom",
  },
  {
    id: "show-2",
    name: "Sharma Hardware & Bath World",
    address: "Plot 42, Main Commercial Market, Sector 15",
    city: "Ghaziabad",
    state: "Uttar Pradesh",
    pinCode: "201012",
    phone: "9876543210",
    type: "Exclusive Trade Dealer",
  },
  {
    id: "show-3",
    name: "Mehta Sanitary & Faucet Gallery",
    address: "Suite 102, Senapati Bapat Marg, Lower Parel",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400013",
    phone: "022-24981122",
    type: "Authorized Flagship Showroom",
  },
  {
    id: "show-4",
    name: "Patel Bath World & Fittings",
    address: "CG Road, Opposite Navrangpura Bus Stand",
    city: "Ahmedabad",
    state: "Gujarat",
    pinCode: "380009",
    phone: "9988776655",
    type: "Exclusive Trade Dealer",
  },
];

export default function UserStoreLocatorPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");

  const filtered = MOCK_SHOWROOMS.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesQ =
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q) ||
      s.pinCode.includes(q);
    const matchesState = selectedState === "All" || s.state === selectedState;
    return matchesQ && matchesState;
  });

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] flex flex-col font-sans text-slate-900">
      <Header />

      <section data-header-theme="light" className="w-full pt-[130px] pb-[80px] px-4 max-w-6xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full uppercase tracking-wider">
            Authorized Showrooms & Dealers
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Find Nearby RN Experience Center
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Locate authorized RN Valves & Faucets dealers, touch-and-feel luxury bathware displays near you.
          </p>
        </div>

        {/* Search & State Filter */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by City, Pincode, or Showroom Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="All">All States (India)</option>
              <option value="Delhi">Delhi</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
            </select>
          </div>
        </div>

        {/* Showrooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                    s.type === "Authorized Flagship Showroom" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200"
                  }`}>
                    {s.type}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-semibold">{s.pinCode}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{s.address}, {s.city}, {s.state} - {s.pinCode}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-slate-400 flex-shrink-0" />
                    <a href={`tel:${s.phone}`} className="font-bold text-slate-900 hover:text-sky-600">{s.phone}</a>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">{s.city}, {s.state}</span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${s.name} ${s.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <Navigation size={13} />
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
