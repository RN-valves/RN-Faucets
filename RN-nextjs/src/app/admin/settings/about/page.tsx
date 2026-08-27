"use client";

import { useEffect, useState, useRef } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminAboutSetting,
  updateAdminAboutSetting,
  uploadFileToR2,
  deleteFileFromR2,
} from "@/utils/adminStore";
import { useAdminTheme } from "@/app/admin/layout";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Video,
  Award,
  Clock,
  Globe,
  Building,
} from "lucide-react";

// Reusable R2 Upload Component
function R2UploadPicker({
  label,
  r2Key,
  currentUrl,
  onUploadSuccess,
  onRemove,
  accept = "image/*",
}: {
  label: string;
  r2Key: string;
  currentUrl: string;
  onUploadSuccess: (newUrl: string) => void;
  onRemove?: () => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const res = await uploadFileToR2(file, r2Key);
    setUploading(false);

    if (res.success && res.url) {
      onUploadSuccess(res.url);
    } else {
      alert("Failed to upload file to Cloudflare R2.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "#111827", display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>R2 Key: {r2Key}</span>
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "10px" }}>
        {currentUrl ? (
          <div style={{ width: "60px", height: "60px", borderRadius: "6px", overflow: "hidden", border: "1px solid #D1D5DB", flexShrink: 0, position: "relative", background: "#111827" }}>
            <img src={currentUrl} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ width: "60px", height: "60px", borderRadius: "6px", border: "1px dashed #9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flexShrink: 0 }}>
            <ImageIcon size={20} />
          </div>
        )}

        <div style={{ flex: 1, display: "flex", gap: "8px", alignItems: "center" }}>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} style={{ display: "none" }} />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "6px",
              border: "1px solid #0077B6",
              background: "#E0F2FE",
              color: "#0077B6",
              fontWeight: 700,
              fontSize: "12px",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <Upload size={14} /> {uploading ? "Uploading..." : currentUrl ? "Change Image" : "Upload File"}
          </button>

          {currentUrl && onRemove && (
            <button
              type="button"
              onClick={() => {
                deleteFileFromR2(r2Key);
                onRemove();
              }}
              style={{
                padding: "7px 12px",
                borderRadius: "6px",
                border: "1px solid #EF4444",
                background: "transparent",
                color: "#EF4444",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAboutSettingPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero_intro" | "manufacturing" | "milestones" | "network" | "awards">("hero_intro");
  const [successMsg, setSuccessMsg] = useState("");

  const isDark = theme === "dark";

  // Color Tokens
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  // Full About Page Settings State
  const [settings, setSettings] = useState<any>(null);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getAdminAboutSetting();
    if (data) setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    const success = await updateAdminAboutSetting(settings);
    setSaving(false);

    if (success) {
      setSuccessMsg("Public About Us Page updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      alert("Failed to save About page settings. Please check database connection.");
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: "40px", color: textMuted, textAlign: "center" }}>
        Loading About Page Settings & R2 Media Architecture...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Public About Page CMS"
        subtitle="Manage hero banner, vision/mission statements, manufacturing features, milestones timeline, network stats, and awards."
        onRefresh={loadSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Success Banner */}
        {successMsg && (
          <div style={{ background: "#0596691A", border: "1px solid #059669", color: "#059669", borderRadius: "10px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 700 }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {/* Top Control Bar with Save Button */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: shadow }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "hero_intro", label: "1. Hero & Intro (Vision/Mission)" },
              { id: "manufacturing", label: "2. Manufacturing & Video" },
              { id: "milestones", label: "3. History & Milestones" },
              { id: "network", label: "4. Distribution Network" },
              { id: "awards", label: "5. Awards & Recognition" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${activeTab === t.id ? "#0077B6" : border}`,
                  background: activeTab === t.id ? (isDark ? "#1F6FEB22" : "#E0F2FE") : inputBg,
                  color: activeTab === t.id ? "#0077B6" : textMuted,
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(90deg, #0077B6 0%, #0096C7 100%)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(0,119,182,0.3)",
            }}
          >
            <Save size={16} /> {saving ? "Saving..." : "Save About Settings"}
          </button>
        </div>

        {/* Tab 1: Hero & Intro */}
        {activeTab === "hero_intro" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Hero Banner */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                Hero Section Asset (R2 Key: website/about/hero.webp)
              </h3>
              <R2UploadPicker
                label="Full-Bleed Hero Image Asset"
                r2Key="website/about/hero.webp"
                currentUrl={settings.hero?.image || ""}
                onUploadSuccess={(url) => setSettings({ ...settings, hero: { ...settings.hero, image: url } })}
              />
            </div>

            {/* Intro, Vision & Mission */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                Company Intro, Vision & Mission Statements
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Intro Title Prefix</label>
                  <input type="text" value={settings.introVisionMission?.introTitle || ""} onChange={(e) => setSettings({ ...settings, introVisionMission: { ...settings.introVisionMission, introTitle: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Intro Accent Subtitle</label>
                  <input type="text" value={settings.introVisionMission?.introAccentText || ""} onChange={(e) => setSettings({ ...settings, introVisionMission: { ...settings.introVisionMission, introAccentText: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Company Intro Description Paragraph</label>
                  <textarea rows={3} value={settings.introVisionMission?.introDescription || ""} onChange={(e) => setSettings({ ...settings, introVisionMission: { ...settings.introVisionMission, introDescription: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Vision Statement</label>
                  <textarea rows={4} value={settings.introVisionMission?.visionText || ""} onChange={(e) => setSettings({ ...settings, introVisionMission: { ...settings.introVisionMission, visionText: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Mission Statement</label>
                  <textarea rows={4} value={settings.introVisionMission?.missionText || ""} onChange={(e) => setSettings({ ...settings, introVisionMission: { ...settings.introVisionMission, missionText: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manufacturing & Video */}
        {activeTab === "manufacturing" && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
            <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
              State-Of-The-Art Manufacturing & Operations Excellence
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Pan-India Distributor Statement</label>
                <textarea rows={2} value={settings.manufacturingSection?.statement || ""} onChange={(e) => setSettings({ ...settings, manufacturingSection: { ...settings.manufacturingSection, statement: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Section Heading</label>
                  <input type="text" value={settings.manufacturingSection?.heading || ""} onChange={(e) => setSettings({ ...settings, manufacturingSection: { ...settings.manufacturingSection, heading: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>YouTube Video Embed URL</label>
                  <input type="text" value={settings.manufacturingSection?.youtubeEmbed || ""} onChange={(e) => setSettings({ ...settings, manufacturingSection: { ...settings.manufacturingSection, youtubeEmbed: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Section Description</label>
                <textarea rows={3} value={settings.manufacturingSection?.description || ""} onChange={(e) => setSettings({ ...settings, manufacturingSection: { ...settings.manufacturingSection, description: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
              </div>

              {/* Manufacturing Features List */}
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>Manufacturing Checkpoint Features</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...(settings.manufacturingSection?.features || []), "New feature checkpoint"];
                      setSettings({ ...settings, manufacturingSection: { ...settings.manufacturingSection, features: updated } });
                    }}
                    style={{ padding: "4px 10px", borderRadius: "6px", border: "none", background: "#059669", color: "#FFF", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
                  >
                    + Add Feature
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {settings.manufacturingSection?.features?.map((feat: string, index: number) => (
                    <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input type="text" value={feat} onChange={(e) => {
                        const updated = [...settings.manufacturingSection.features];
                        updated[index] = e.target.value;
                        setSettings({ ...settings, manufacturingSection: { ...settings.manufacturingSection, features: updated } });
                      }} style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />

                      <button
                        type="button"
                        onClick={() => {
                          const updated = settings.manufacturingSection.features.filter((_: any, i: number) => i !== index);
                          setSettings({ ...settings, manufacturingSection: { ...settings.manufacturingSection, features: updated } });
                        }}
                        style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Milestones Timeline */}
        {activeTab === "milestones" && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, color: textMain, fontSize: "16px" }}>Company Journey & History Milestones</h3>
              <button
                type="button"
                onClick={() => {
                  const id = String(Date.now());
                  const newMilestone = {
                    id,
                    year: "2026",
                    title: "New Milestone Title",
                    text: "Milestone description details...",
                  };
                  setSettings({
                    ...settings,
                    timelineSection: {
                      ...settings.timelineSection,
                      milestones: [newMilestone, ...(settings.timelineSection?.milestones || [])],
                    },
                  });
                }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "6px", border: "none", background: "#059669", color: "#FFF", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                <Plus size={14} /> Add Milestone
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {settings.timelineSection?.milestones?.map((item: any, index: number) => {
                const milestoneId = item.id || item.year || String(index);
                const r2Key = `website/about/timeline/${milestoneId}.webp`;

                return (
                  <div key={milestoneId} style={{ border: `1px solid ${border}`, borderRadius: "10px", padding: "16px", background: inputBg, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: "13px", color: "#0077B6" }}>Milestone Year: {item.year}</span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteFileFromR2(r2Key);
                          const updated = settings.timelineSection.milestones.filter((_: any, i: number) => i !== index);
                          setSettings({
                            ...settings,
                            timelineSection: { ...settings.timelineSection, milestones: updated },
                          });
                        }}
                        style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "12px" }}>
                      <input type="text" placeholder="Year (e.g. 2025)" value={item.year} onChange={(e) => {
                        const updated = [...settings.timelineSection.milestones];
                        updated[index].year = e.target.value;
                        setSettings({ ...settings, timelineSection: { ...settings.timelineSection, milestones: updated } });
                      }} style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                      <input type="text" placeholder="Milestone Headline Title" value={item.title} onChange={(e) => {
                        const updated = [...settings.timelineSection.milestones];
                        updated[index].title = e.target.value;
                        setSettings({ ...settings, timelineSection: { ...settings.timelineSection, milestones: updated } });
                      }} style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </div>

                    <textarea rows={2} placeholder="Milestone Description" value={item.text} onChange={(e) => {
                      const updated = [...settings.timelineSection.milestones];
                      updated[index].text = e.target.value;
                      setSettings({ ...settings, timelineSection: { ...settings.timelineSection, milestones: updated } });
                    }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                    <R2UploadPicker
                      label="Milestone Optional Image Asset"
                      r2Key={r2Key}
                      currentUrl={item.image || ""}
                      onUploadSuccess={(url) => {
                        const updated = [...settings.timelineSection.milestones];
                        updated[index].image = url;
                        setSettings({ ...settings, timelineSection: { ...settings.timelineSection, milestones: updated } });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Distribution Network */}
        {activeTab === "network" && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
            <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
              Pan-India Distribution & Factory Network Settings
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Eyebrow Label</label>
                  <input type="text" value={settings.networkSection?.eyebrow || ""} onChange={(e) => setSettings({ ...settings, networkSection: { ...settings.networkSection, eyebrow: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Heading</label>
                  <input type="text" value={settings.networkSection?.heading || ""} onChange={(e) => setSettings({ ...settings, networkSection: { ...settings.networkSection, heading: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Description</label>
                <textarea rows={3} value={settings.networkSection?.description || ""} onChange={(e) => setSettings({ ...settings, networkSection: { ...settings.networkSection, description: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
              </div>

              {/* Animated Counters */}
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: textMain, marginBottom: "10px" }}>Animated Network Counters (4 Grid Items)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {settings.networkSection?.stats?.map((stat: any, index: number) => (
                    <div key={index} style={{ border: `1px solid ${border}`, borderRadius: "8px", padding: "12px", background: inputBg, display: "grid", gridTemplateColumns: "100px 60px 1fr", gap: "8px" }}>
                      <input type="number" placeholder="Value" value={stat.value} onChange={(e) => {
                        const updated = [...settings.networkSection.stats];
                        updated[index].value = Number(e.target.value);
                        setSettings({ ...settings, networkSection: { ...settings.networkSection, stats: updated } });
                      }} style={{ padding: "6px 8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                      <input type="text" placeholder="Suffix" value={stat.suffix} onChange={(e) => {
                        const updated = [...settings.networkSection.stats];
                        updated[index].suffix = e.target.value;
                        setSettings({ ...settings, networkSection: { ...settings.networkSection, stats: updated } });
                      }} style={{ padding: "6px 8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                      <input type="text" placeholder="Label" value={stat.label} onChange={(e) => {
                        const updated = [...settings.networkSection.stats];
                        updated[index].label = e.target.value;
                        setSettings({ ...settings, networkSection: { ...settings.networkSection, stats: updated } });
                      }} style={{ padding: "6px 8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Awards & Recognition */}
        {activeTab === "awards" && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, color: textMain, fontSize: "16px" }}>Awards & Achievements Recognition</h3>
              <button
                type="button"
                onClick={() => {
                  const id = String(Date.now());
                  const newAward = {
                    id,
                    title: "New Award Title",
                    organization: "Organization Forum",
                    description: "Award description and recognition details...",
                    year: "2025",
                  };
                  setSettings({
                    ...settings,
                    awardsSection: {
                      ...settings.awardsSection,
                      awards: [...(settings.awardsSection?.awards || []), newAward],
                    },
                  });
                }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "6px", border: "none", background: "#059669", color: "#FFF", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                <Plus size={14} /> Add Award Card
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {settings.awardsSection?.awards?.map((award: any, index: number) => {
                const awardId = award.id || String(index);
                const r2Key = `website/about/awards/${awardId}.webp`;

                return (
                  <div key={awardId} style={{ border: `1px solid ${border}`, borderRadius: "10px", padding: "16px", background: inputBg, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: "13px", color: "#0077B6" }}>Award #{index + 1} ({award.year})</span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteFileFromR2(r2Key);
                          const updated = settings.awardsSection.awards.filter((_: any, i: number) => i !== index);
                          setSettings({
                            ...settings,
                            awardsSection: { ...settings.awardsSection, awards: updated },
                          });
                        }}
                        style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <input type="text" placeholder="Award Title" value={award.title} onChange={(e) => {
                      const updated = [...settings.awardsSection.awards];
                      updated[index].title = e.target.value;
                      setSettings({ ...settings, awardsSection: { ...settings.awardsSection, awards: updated } });
                    }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "8px" }}>
                      <input type="text" placeholder="Awarding Organization" value={award.organization} onChange={(e) => {
                        const updated = [...settings.awardsSection.awards];
                        updated[index].organization = e.target.value;
                        setSettings({ ...settings, awardsSection: { ...settings.awardsSection, awards: updated } });
                      }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                      <input type="text" placeholder="Year" value={award.year} onChange={(e) => {
                        const updated = [...settings.awardsSection.awards];
                        updated[index].year = e.target.value;
                        setSettings({ ...settings, awardsSection: { ...settings.awardsSection, awards: updated } });
                      }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </div>

                    <textarea rows={2} placeholder="Description" value={award.description} onChange={(e) => {
                      const updated = [...settings.awardsSection.awards];
                      updated[index].description = e.target.value;
                      setSettings({ ...settings, awardsSection: { ...settings.awardsSection, awards: updated } });
                    }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                    <R2UploadPicker
                      label="Award Badge Image Asset"
                      r2Key={r2Key}
                      currentUrl={award.image || ""}
                      onUploadSuccess={(url) => {
                        const updated = [...settings.awardsSection.awards];
                        updated[index].image = url;
                        setSettings({ ...settings, awardsSection: { ...settings.awardsSection, awards: updated } });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
