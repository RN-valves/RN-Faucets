"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { FileText, Download, QrCode, ExternalLink, Sparkles, BookOpen } from "lucide-react";
import { getAdminCatalogues } from "@/utils/adminStore";
import { AdminCataloguePdf } from "@/types/admin";

export default function UserCataloguesPage() {
  const [catalogues, setCatalogues] = useState<AdminCataloguePdf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalogues() {
      setLoading(true);
      const data = await getAdminCatalogues();
      setCatalogues(data);
      setLoading(false);
    }
    loadCatalogues();
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] flex flex-col font-sans text-slate-900">
      <Header />

      <section data-header-theme="light" className="w-full pt-[130px] pb-[80px] px-4 max-w-6xl mx-auto space-y-8">
        {/* Banner Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full uppercase tracking-wider">
            Official Product Literature
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            PDF Catalogues & Technical Brochures
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Download high-resolution product catalogues, dimensional specs, and print-ready QR brochures.
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl">
            Loading published catalogues...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogues.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <FileText size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">High-Resolution PDF Brochure</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <a
                    href={cat.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow"
                  >
                    <Download size={15} />
                    Download PDF Brochure
                  </a>

                  <a
                    href={cat.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    View Online Flipbook
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
