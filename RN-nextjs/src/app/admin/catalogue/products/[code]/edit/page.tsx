"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminProductByCode,
  updateAdminProduct,
  getAdminCategories,
  getAdminSubcategories,
  getAdminAttributes,
  uploadFileToR2,
  deleteFileFromR2,
} from "@/utils/adminStore";
import { AdminProduct, AdminCategory, AdminSubcategory, AdminAttributeItem } from "@/types/admin";
import { useAdminTheme } from "@/app/admin/layout";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
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
      alert("Failed to upload image to Cloudflare R2.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "#111827", display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>R2: {r2Key}</span>
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px" }}>
        {currentUrl ? (
          <div style={{ width: "48px", height: "48px", borderRadius: "6px", overflow: "hidden", border: "1px solid #D1D5DB", flexShrink: 0, position: "relative", background: "#111827" }}>
            <img src={currentUrl} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ width: "48px", height: "48px", borderRadius: "6px", border: "1px dashed #9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flexShrink: 0 }}>
            <ImageIcon size={18} />
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
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #0077B6",
              background: "#E0F2FE",
              color: "#0077B6",
              fontWeight: 700,
              fontSize: "12px",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <Upload size={13} /> {uploading ? "Uploading..." : currentUrl ? "Change Image" : "Upload File"}
          </button>

          {currentUrl && onRemove && (
            <button
              type="button"
              onClick={() => {
                deleteFileFromR2(r2Key);
                onRemove();
              }}
              style={{
                padding: "6px 10px",
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = params?.code as string;
  const code = decodeURIComponent(rawCode || "");

  const { theme, toggleTheme } = useAdminTheme();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [subcategories, setSubcategories] = useState<AdminSubcategory[]>([]);
  const [brands, setBrands] = useState<AdminAttributeItem[]>([]);
  const [colors, setColors] = useState<AdminAttributeItem[]>([]);
  const [sizes, setSizes] = useState<AdminAttributeItem[]>([]);
  const [materials, setMaterials] = useState<AdminAttributeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [skuCode, setSkuCode] = useState("");
  const [article, setArticle] = useState("");
  const [hsn, setHsn] = useState("");

  const [category, setCategory] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [material, setMaterial] = useState("");
  const [colorName, setColorName] = useState("");
  const [size, setSize] = useState("");
  const [saleType, setSaleType] = useState("");

  // Multi-tier Pricing
  const [inMrp, setInMrp] = useState<number>(0);
  const [inSelling, setInSelling] = useState<number>(0);
  const [inV1Mrp, setInV1Mrp] = useState<number>(0);
  const [othMrp, setOthMrp] = useState<number>(0);
  const [othSelling, setOthSelling] = useState<number>(0);
  const [othV1Mrp, setOthV1Mrp] = useState<number>(0);

  // Logistics & Attributes Specs
  const [stock, setStock] = useState<number>(0);
  const [moq, setMoq] = useState<number>(1);
  const [ctnPcs, setCtnPcs] = useState<number>(0);
  const [midCtnPcs, setMidCtnPcs] = useState<number>(0);
  const [innerPcs, setInnerPcs] = useState<number>(0);
  const [stockPcs, setStockPcs] = useState<number>(0);

  const [productLength, setProductLength] = useState<number>(0);
  const [productBreadth, setProductBreadth] = useState<number>(0);
  const [productHeight, setProductHeight] = useState<number>(0);

  const [onlyProductWtGm, setOnlyProductWtGm] = useState<number>(0);
  const [productLbhWeightGm, setProductLbhWeightGm] = useState<number>(0);
  const [midCtnLbhWeightKg, setMidCtnLbhWeightKg] = useState<number>(0);
  const [masterCtnLbhWeightKg, setMasterCtnLbhWeightKg] = useState<number>(0);

  const [residentialWarranty, setResidentialWarranty] = useState<number>(0);
  const [commercialWarranty, setCommercialWarranty] = useState<number>(0);

  // Media
  const [image, setImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [amazonLink, setAmazonLink] = useState("");
  const [flipkartLink, setFlipkartLink] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // SEO & Visibilities
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [searchKeywords, setSearchKeywords] = useState("");

  const [status, setStatus] = useState<any>("In Stock");
  const [isVisibleWebsite, setIsVisibleWebsite] = useState(true);
  const [isVisibleApi, setIsVisibleApi] = useState(true);
  const [newArrival, setNewArrival] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFullTurn, setIsFullTurn] = useState(false);
  const [fullTurnCode, setFullTurnCode] = useState("");

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  useEffect(() => {
    async function init() {
      if (!code) return;
      setLoading(true);

      const [prodData, cats, subs, bList, cList, sList, mList] = await Promise.all([
        getAdminProductByCode(code),
        getAdminCategories(),
        getAdminSubcategories(),
        getAdminAttributes("Brand"),
        getAdminAttributes("Color"),
        getAdminAttributes("Size"),
        getAdminAttributes("Material"),
      ]);

      setCategories(cats);
      setSubcategories(subs);
      setBrands(bList);
      setColors(cList);
      setSizes(sList);
      setMaterials(mList);

      if (prodData) {
        setProduct(prodData);
        setName(prodData.name || "");
        setItemCode(prodData.code || prodData.id || "");
        setSkuCode(prodData.skuCode || "");
        setArticle(prodData.article || "");
        setHsn(prodData.hsn || "");
        setCategory(prodData.category || (cats[0]?.name ?? ""));
        setSubcategoryId(prodData.subcategoryId || "");
        setBrand(prodData.brand || "");
        setMaterial(prodData.material || "");
        setColorName(prodData.colorName || "");
        setSize(prodData.size || "");
        setSaleType(prodData.saleType || "");

        setInMrp(prodData.inMrp || prodData.price || 0);
        setInSelling(prodData.inSelling || prodData.price || 0);
        setInV1Mrp(prodData.inV1Mrp || 0);
        setOthMrp(prodData.othMrp || 0);
        setOthSelling(prodData.othSelling || 0);
        setOthV1Mrp(prodData.othV1Mrp || 0);

        setStock(prodData.stock || 0);
        setStockPcs(prodData.stockPcs || prodData.stock || 0);
        setMoq(prodData.moq || 1);
        setCtnPcs(prodData.ctnPcs || 0);
        setMidCtnPcs(prodData.midCtnPcs || 0);
        setInnerPcs(prodData.innerPcs || 0);

        setProductLength(prodData.productLength || 0);
        setProductBreadth(prodData.productBreadth || 0);
        setProductHeight(prodData.productHeight || 0);

        setOnlyProductWtGm(prodData.onlyProductWtGm || 0);
        setResidentialWarranty(prodData.residentialWarranty || 0);
        setCommercialWarranty(prodData.commercialWarranty || 0);

        setImage(prodData.image || "");
        setVideoUrl(prodData.videoUrl || "");
        setAmazonLink(prodData.amazonLink || "");
        setFlipkartLink(prodData.flipkartLink || "");

        setTitle(prodData.title || "");
        setKeywords(prodData.keywords || "");
        setDescription(prodData.description || "");
        setSearchKeywords(prodData.searchKeywords || "");

        setStatus(prodData.status || "In Stock");
        setIsVisibleWebsite(prodData.isVisibleWebsite !== false);
        setIsVisibleApi(prodData.isVisibleApi !== false);
        setNewArrival(Boolean(prodData.newArrival));
        setIsFeatured(Boolean(prodData.isFeatured));
        setIsFullTurn(Boolean(prodData.isFullTurn));
        setFullTurnCode(prodData.fullTurnCode || "");
      }

      setLoading(false);
    }

    init();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !name.trim() || !itemCode.trim()) return;

    setSubmitting(true);
    const parentSub = subcategories.find((s) => s.id === subcategoryId);

    const updated = await updateAdminProduct(product.id, {
      name: name.trim(),
      code: itemCode.trim(),
      skuCode: skuCode.trim() || itemCode.trim(),
      article: article.trim(),
      hsn: hsn.trim(),
      category,
      subcategoryId,
      subcategoryName: parentSub?.name || "",
      brand,
      material,
      colorName,
      size,
      saleType,
      price: Number(inSelling) || Number(inMrp) || 0,
      originalPrice: Number(inMrp) || 0,

      // Multi-tier Prices
      inMrp: Number(inMrp),
      inSelling: Number(inSelling),
      inV1Mrp: Number(inV1Mrp),
      othMrp: Number(othMrp),
      othSelling: Number(othSelling),
      othV1Mrp: Number(othV1Mrp),

      // Stock & Specs
      stock: Number(stock),
      stockPcs: Number(stockPcs) || Number(stock),
      moq: Number(moq),
      ctnPcs: Number(ctnPcs),
      midCtnPcs: Number(midCtnPcs),
      innerPcs: Number(innerPcs),

      productLength: Number(productLength),
      productBreadth: Number(productBreadth),
      productHeight: Number(productHeight),

      onlyProductWtGm: Number(onlyProductWtGm),
      residentialWarranty: Number(residentialWarranty),
      commercialWarranty: Number(commercialWarranty),

      image,
      videoUrl: videoUrl.trim(),
      amazonLink: amazonLink.trim(),
      flipkartLink: flipkartLink.trim(),

      title: title.trim(),
      keywords: keywords.trim(),
      description: description.trim(),
      searchKeywords: searchKeywords.trim(),

      status,
      isVisibleWebsite,
      isVisibleApi,
      newArrival,
      isFeatured,
      isFullTurn,
      fullTurnCode,
    });

    setSubmitting(false);

    if (updated) {
      router.push(`/admin/catalogue/products/${encodeURIComponent(updated.code || itemCode.trim())}`);
    } else {
      alert("Failed to update product.");
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Edit Product" theme={theme} onToggleTheme={toggleTheme} />
        <div style={{ padding: "60px", textAlign: "center", color: textMuted }}>Loading product edit form...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Product Not Found" theme={theme} onToggleTheme={toggleTheme} />
        <div style={{ padding: "60px", textAlign: "center", color: textMuted }}>
          <h3>Product "{code}" not found.</h3>
          <Link href="/admin/catalogue/products" style={{ color: "#0077B6", fontWeight: 700, marginTop: "12px", display: "inline-block" }}>
            Back to Products Listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title={`Edit Product: ${product.name}`}
        subtitle={`Update product code ${itemCode}, prices, stock, specs, and R2 media assets.`}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Navigation Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href={`/admin/catalogue/products/${encodeURIComponent(itemCode)}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to View Product
          </Link>
        </div>

        {/* Form Container */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "32px", boxShadow: shadow }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Row 1: Brand, Category, Subcategory, Material */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Category *</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontWeight: 700 }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Subcategory</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.categoryName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Material</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                >
                  <option value="">Select Material</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Color, Size, Sale Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Color</label>
                <select
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                >
                  <option value="">Select Color</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                >
                  <option value="">Select Size</option>
                  {sizes.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Sale Type</label>
                <input
                  type="text"
                  value={saleType}
                  onChange={(e) => setSaleType(e.target.value)}
                  placeholder="e.g. Retail / Wholesale"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* Item Name, Article, Item Code, HSN */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Single Lever Basin Mixer"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Product Article</label>
                <input
                  type="text"
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  placeholder="Article"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Product Code (SKU) *</label>
                <input
                  type="text"
                  required
                  value={itemCode}
                  onChange={(e) => {
                    setItemCode(e.target.value);
                    if (!skuCode) setSkuCode(e.target.value);
                  }}
                  placeholder="F410011GRT"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>HSN Code</label>
                <input
                  type="text"
                  value={hsn}
                  onChange={(e) => setHsn(e.target.value)}
                  placeholder="8481"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* Multi-tier Pricing Section Table */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0077B6" }}>Country Multi-tier Pricing Table</span>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: isDark ? "#21262D" : "#E5E7EB", color: textMain }}>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Country</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>MRP</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Selling Price</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>V1 MRP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 12px", fontWeight: 700 }}>India (₹)</td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="number"
                        value={inMrp}
                        onChange={(e) => setInMrp(Number(e.target.value))}
                        placeholder="MRP"
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain, fontWeight: 700 }}
                      />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="number"
                        value={inSelling}
                        onChange={(e) => setInSelling(Number(e.target.value))}
                        placeholder="Selling"
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: "#059669", fontWeight: 800 }}
                      />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="number"
                        value={inV1Mrp}
                        onChange={(e) => setInV1Mrp(Number(e.target.value))}
                        placeholder="V1 MRP"
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 12px", fontWeight: 700 }}>Other ($)</td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="number"
                        value={othMrp}
                        onChange={(e) => setOthMrp(Number(e.target.value))}
                        placeholder="MRP"
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                      />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="number"
                        value={othSelling}
                        onChange={(e) => setOthSelling(Number(e.target.value))}
                        placeholder="Selling"
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                      />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="number"
                        value={othV1Mrp}
                        onChange={(e) => setOthV1Mrp(Number(e.target.value))}
                        placeholder="V1 MRP"
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Product Attributes Specs Table */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0077B6" }}>Product Attributes Details Table</span>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: isDark ? "#21262D" : "#E5E7EB", color: textMain }}>
                    <th style={{ padding: "6px" }}>CTN Pcs</th>
                    <th style={{ padding: "6px" }}>Mid. CTN Pcs</th>
                    <th style={{ padding: "6px" }}>Inner Pcs</th>
                    <th style={{ padding: "6px" }}>Stock Pcs</th>
                    <th style={{ padding: "6px" }}>Length</th>
                    <th style={{ padding: "6px" }}>Breadth</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px" }}>
                      <input type="number" value={ctnPcs} onChange={(e) => setCtnPcs(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" value={midCtnPcs} onChange={(e) => setMidCtnPcs(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" value={innerPcs} onChange={(e) => setInnerPcs(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" value={stockPcs} onChange={(e) => setStockPcs(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" step="any" value={productLength} onChange={(e) => setProductLength(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" step="any" value={productBreadth} onChange={(e) => setProductBreadth(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                  </tr>
                </tbody>
              </table>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginTop: "8px" }}>
                <thead>
                  <tr style={{ background: isDark ? "#21262D" : "#E5E7EB", color: textMain }}>
                    <th style={{ padding: "6px" }}>Height</th>
                    <th style={{ padding: "6px" }}>Weight (GM)</th>
                    <th style={{ padding: "6px" }}>Inner LBH Wt (GM)</th>
                    <th style={{ padding: "6px" }}>Mid BOX Wt (KG)</th>
                    <th style={{ padding: "6px" }}>Master BOX Wt (KG)</th>
                    <th style={{ padding: "6px" }}>Res. Warranty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px" }}>
                      <input type="number" step="any" value={productHeight} onChange={(e) => setProductHeight(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" step="any" value={onlyProductWtGm} onChange={(e) => setOnlyProductWtGm(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" step="any" value={productLbhWeightGm} onChange={(e) => setProductLbhWeightGm(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" step="any" value={midCtnLbhWeightKg} onChange={(e) => setMidCtnLbhWeightKg(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" step="any" value={masterCtnLbhWeightKg} onChange={(e) => setMasterCtnLbhWeightKg(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                    <td style={{ padding: "4px" }}>
                      <input type="number" value={residentialWarranty} onChange={(e) => setResidentialWarranty(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Status & Visibilities Flags Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", gap: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain, fontWeight: 700 }}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Visible Web?</label>
                <select
                  value={isVisibleWebsite ? "1" : "0"}
                  onChange={(e) => setIsVisibleWebsite(e.target.value === "1")}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain, fontWeight: 700 }}
                >
                  <option value="1">Visible</option>
                  <option value="0">InVisible</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Visible API?</label>
                <select
                  value={isVisibleApi ? "1" : "0"}
                  onChange={(e) => setIsVisibleApi(e.target.value === "1")}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                >
                  <option value="1">Visible</option>
                  <option value="0">InVisible</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>New Arrival?</label>
                <select
                  value={newArrival ? "1" : "0"}
                  onChange={(e) => setNewArrival(e.target.value === "1")}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                >
                  <option value="1">Visible</option>
                  <option value="0">InVisible</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Is Featured?</label>
                <select
                  value={isFeatured ? "1" : "0"}
                  onChange={(e) => setIsFeatured(e.target.value === "1")}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                >
                  <option value="1">Visible</option>
                  <option value="0">InVisible</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>ISI Certified?</label>
                <select
                  value={isFullTurn ? "1" : "0"}
                  onChange={(e) => setIsFullTurn(e.target.value === "1")}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            </div>

            {/* Main Product Image (Cloudflare R2) */}
            <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0077B6", display: "block", marginBottom: "10px" }}>Main Product Image (Cloudflare R2)</span>

              <R2UploadPicker
                label="Product Main Image (size: 900x900px)"
                r2Key={`website/catalogue/products/${encodeURIComponent(itemCode || product.id)}/image.webp`}
                currentUrl={image}
                onUploadSuccess={(url) => setImage(url)}
                onRemove={() => setImage("")}
              />
            </div>

            {/* Commercial Warranty, Short Description, Video & Marketplace Links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Comm. Warranty (Yrs)</label>
                <input
                  type="number"
                  value={commercialWarranty}
                  onChange={(e) => setCommercialWarranty(Number(e.target.value))}
                  placeholder="0"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Product Video URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Amazon Link</label>
                <input
                  type="text"
                  value={amazonLink}
                  onChange={(e) => setAmazonLink(e.target.value)}
                  placeholder="https://amazon.in/..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Flipkart Link</label>
                <input
                  type="text"
                  value={flipkartLink}
                  onChange={(e) => setFlipkartLink(e.target.value)}
                  placeholder="https://flipkart.com/..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* SEO Title, Keywords, Description & Search Keywords */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="SEO Title"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="SEO Keywords"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Search Keywords</label>
                <input
                  type="text"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  placeholder="Search Keywords"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="SEO Description"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
              />
            </div>

            {/* Form Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: `1px solid ${border}`, paddingTop: "20px", marginTop: "10px" }}>
              <Link
                href={`/admin/catalogue/products/${encodeURIComponent(itemCode)}`}
                style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${border}`, background: "transparent", color: textMuted, fontWeight: 700, textDecoration: "none" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "8px", border: "none", background: "#0077B6", color: "#FFFFFF", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                <Save size={16} /> {submitting ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
