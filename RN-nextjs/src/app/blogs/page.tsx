"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { BookOpen, Calendar, User, ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";

interface BlogItem {
  _id: string;
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  image: string;
  summary: string;
  content: string;
  publishedAt: string;
}

export default function UserBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const res = await fetch("/api/blogs");
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.blogs || []);
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filteredBlogs = selectedCategory === "All"
    ? blogs
    : blogs.filter((b) => b.category === selectedCategory);

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] flex flex-col font-sans text-slate-900">
      <Header />

      <section data-header-theme="light" className="w-full pt-[130px] pb-[60px] px-4 max-w-7xl mx-auto space-y-8">
        {/* Banner Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded-full uppercase tracking-wider">
            RN Design & Living Journal
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Bath Space Inspiration & Care Guides
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Explore architectural bathroom trends, maintenance guides, finish guides, and faucet installation technology.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl">
            Loading articles...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-16 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl">
            No articles found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((b) => (
              <article
                key={b._id || b.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                        {b.category}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar size={12} />
                        {b.publishedAt}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                      {b.title}
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {b.summary}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between text-xs font-bold border-t border-slate-100 mt-4">
                  <span className="text-slate-500 flex items-center gap-1">
                    <User size={13} />
                    {b.author}
                  </span>
                  <span className="text-slate-900 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read Article <ArrowRight size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
