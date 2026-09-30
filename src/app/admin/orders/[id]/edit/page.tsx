"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminTheme } from "@/app/admin/layout";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Save,
  Package,
  User as UserIcon,
  MapPin,
  CreditCard,
  Tag,
  Truck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface OrderItem {
  id?: string | number;
  productId?: string;
  name: string;
  code?: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  lbhWeight?: string | number;
  image?: string;
}

interface ProductResult {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
  skuCode?: string;
  size?: string;
  colorName?: string;
  article?: string;
  in_mrp?: number;
  oth_mrp?: number;
  mrp?: number;
  sellingPrice?: number;
  price?: number;
  category?: string;
  subcategoryName?: string;
  onlyProductWtGm?: number;
  image?: string;
}

interface AddressOption {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
}

export default function AdminOrderEditPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const isDark = theme === "dark";
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const bgSubtle = isDark ? "#161B22" : "#F9FAFB";

  // Data States
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable Form States
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shippingAmount, setShippingAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentTerm, setPaymentTerm] = useState<string>("100% Advanced");
  const [note, setNote] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<AddressOption>({
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    firstName: "",
  });
  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);

  // Catalogue Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [productsList, setProductsList] = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  // Product Add Row Input buffer: map of product ID to { price, qty }
  const [rowInputs, setRowInputs] = useState<Record<string, { price: number; quantity: number }>>({});

  // Submission State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. Fetch Order and initial category data
  const fetchOrderAndCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderRes, catRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch("/api/categories?all=true"),
      ]);

      if (!orderRes.ok) throw new Error("Failed to fetch order details");
      const orderData = await orderRes.json();
      setOrder(orderData);

      if (orderData.status !== "Pending") {
        setError(`Only "Pending" orders can be edited. Current status is ${orderData.status}.`);
      }

      // Populate form states
      const rawItems: OrderItem[] = Array.isArray(orderData.items)
        ? orderData.items.map((it: any) => ({
            id: it.id || it.productId || it.code,
            productId: it.productId || it.id,
            name: it.name || "Product",
            code: it.code || it.skuCode || "",
            color: it.color || "",
            size: it.size || "",
            price: Number(it.price || 0),
            quantity: Number(it.quantity || 1),
            lbhWeight: it.lbhWeight || 0,
            image: it.image || "",
          }))
        : [];
      setItems(rawItems);

      setShippingAmount(Number(orderData.shippingAmount || 0));
      setDiscountAmount(Number(orderData.discountAmount || 0));
      setPaymentTerm(orderData.payment_term || "100% Advanced");
      setNote(orderData.note || "");

      // Address setup
      const initialAddr: AddressOption = {
        firstName: orderData.customerName || orderData.shippingAddress?.firstName || "",
        lastName: orderData.shippingAddress?.lastName || "",
        phone: orderData.customerPhone || orderData.shippingAddress?.phone || "",
        email: orderData.customerEmail || orderData.shippingAddress?.email || "",
        address: orderData.shippingAddress?.address || "",
        city: orderData.shippingAddress?.city || "",
        state: orderData.shippingAddress?.state || "",
        pinCode: orderData.shippingAddress?.pinCode || "",
        country: orderData.shippingAddress?.country || "India",
      };
      setShippingAddress(initialAddr);

      const customerSavedAddrs = orderData.customer?.addresses || [];
      const combinedAddresses: AddressOption[] = [
        initialAddr,
        ...customerSavedAddrs.map((a: any) => ({
          firstName: a.name || a.firstName || orderData.customerName || "",
          phone: a.mobile || a.phone || orderData.customerPhone || "",
          address: a.address || "",
          city: a.city || "",
          state: a.state || "",
          pinCode: a.zipcode || a.pinCode || "",
          country: a.country || "India",
        })),
      ];
      setAddressOptions(combinedAddresses);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndCategories();
  }, [orderId]);

  // 2. Search Products
  const handleSearchProducts = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const qParams = new URLSearchParams();
      if (searchQuery) qParams.set("q", searchQuery);
      if (selectedCategory) qParams.set("category", selectedCategory);
      if (selectedSubcategory) qParams.set("subcategory", selectedSubcategory);
      qParams.set("limit", "25");

      const res = await fetch(`/api/products?${qParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list: ProductResult[] = Array.isArray(data) ? data : data.products || [];
        setProductsList(list);

        // Pre-fill row buffer prices & quantities
        const buffer: Record<string, { price: number; quantity: number }> = {};
        list.forEach((p) => {
          const pKey = p._id || p.id || p.skuCode || p.name;
          const pPrice = Number(p.in_mrp || p.mrp || p.sellingPrice || p.price || 0);
          buffer[pKey] = { price: pPrice, quantity: 1 };
        });
        setRowInputs(buffer);
      }
    } catch (err) {
      console.error("Product search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Trigger search whenever category or subcategory filter changes
  useEffect(() => {
    if (selectedCategory || selectedSubcategory || searchQuery) {
      handleSearchProducts();
    }
  }, [selectedCategory, selectedSubcategory]);

  // Live Totals Calculation
  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return Math.max(0, Math.round(subtotal + Number(shippingAmount || 0) - Number(discountAmount || 0)));
  }, [subtotal, shippingAmount, discountAmount]);

  // Cart Operations
  const handleAddItem = (product: ProductResult) => {
    const pKey = product._id || product.id || product.skuCode || product.name;
    const inputVals = rowInputs[pKey] || {
      price: Number(product.in_mrp || product.mrp || product.sellingPrice || product.price || 0),
      quantity: 1,
    };

    const newItem: OrderItem = {
      id: product._id || product.id || product.skuCode,
      productId: product._id || product.id,
      name: product.name,
      code: product.skuCode || product.code || "",
      color: product.colorName || "",
      size: product.size || "",
      price: Number(inputVals.price || 0),
      quantity: Math.max(1, Number(inputVals.quantity || 1)),
      lbhWeight: product.onlyProductWtGm || 0,
      image: product.image || "",
    };

    // Check if already in cart
    const existingIdx = items.findIndex(
      (it) => it.code === newItem.code && it.color === newItem.color && it.size === newItem.size
    );

    if (existingIdx >= 0) {
      const copy = [...items];
      copy[existingIdx].quantity += newItem.quantity;
      copy[existingIdx].price = newItem.price; // Update to latest specified price
      setItems(copy);
    } else {
      setItems([...items, newItem]);
    }
  };

  const handleUpdateQty = (index: number, delta: number) => {
    const copy = [...items];
    const newQty = copy[index].quantity + delta;
    if (newQty <= 0) {
      handleRemoveItem(index);
    } else {
      copy[index].quantity = newQty;
      setItems(copy);
    }
  };

  const handleRemoveItem = (index: number) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  // Handle Address Dropdown Selection
  const handleSelectAddress = (index: number) => {
    setSelectedAddressIndex(index);
    if (addressOptions[index]) {
      setShippingAddress(addressOptions[index]);
    }
  };

  // Submit Order Save
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please add at least one product to the order.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        isOrderEdit: true,
        items,
        shippingAmount: Number(shippingAmount || 0),
        discountAmount: Number(discountAmount || 0),
        discountCode: discountAmount > 0 ? "Admin" : order?.discountCode || "",
        totalAmount,
        payment_term: paymentTerm,
        note: note.trim(),
        shippingAddress: {
          firstName: shippingAddress.firstName || order?.customerName || "Customer",
          lastName: shippingAddress.lastName || "",
          phone: shippingAddress.phone || order?.customerPhone || "",
          email: shippingAddress.email || order?.customerEmail || "",
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pinCode: shippingAddress.pinCode,
          country: shippingAddress.country || "India",
        },
      };

      const res = await fetch(`/api/orders/${order._id || order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update order");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push(`/admin/orders/${order._id || order.id}`);
      }, 800);
    } catch (err: any) {
      alert("Error saving order: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const customerName = order?.customerName || order?.shippingAddress?.firstName || "—";
  const customerPhone = order?.customerPhone || order?.shippingAddress?.phone || "—";
  const customerEmail = order?.customerEmail || order?.shippingAddress?.email || "—";
  const customerCity = order?.shippingAddress?.city || "—";
  const customerState = order?.shippingAddress?.state || "—";
  const customerPincode = order?.shippingAddress?.pinCode || "—";
  const customerUserCode = order?.customer?.userCode || order?.uuid || "—";

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0B0F17" : "#F4F6F9" }}>
      <AdminHeader
        title="Edit Order"
        subtitle={`Editing Order #RNOD${order?.id?.replace(/\D/g, "") || orderId}`}
        onRefresh={fetchOrderAndCategories}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Breadcrumbs */}
      <div style={{ padding: "16px 32px 6px", fontSize: "13px", color: textMuted }}>
        <Link href="/admin/dashboard" style={{ color: "#0077B6", textDecoration: "none" }}>Dashboard</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <Link href="/admin/orders" style={{ color: "#0077B6", textDecoration: "none" }}>Orders</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <Link href={`/admin/orders/${orderId}`} style={{ color: "#0077B6", textDecoration: "none" }}>
          #RNOD{order?.id?.replace(/\D/g, "") || orderId}
        </Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <span style={{ color: textMain, fontWeight: 600 }}>Edit Order</span>
      </div>

      <div style={{ padding: "16px 32px 40px", maxWidth: "1550px", margin: "0 auto" }}>
        {loading && (
          <div
            style={{
              padding: "80px 20px",
              textAlign: "center",
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "6px",
              color: textMuted,
            }}
          >
            <Loader2 size={32} style={{ margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
            <div>Loading Order and Catalogue...</div>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              background: cardBg,
              border: "1px solid #DC3545",
              borderRadius: "6px",
              color: "#DC3545",
            }}
          >
            <AlertCircle size={36} style={{ margin: "0 auto 12px" }} />
            <h3 style={{ margin: "0 0 8px" }}>{error}</h3>
            <p style={{ color: textMuted, fontSize: "14px", margin: "0 0 16px" }}>
              Only orders in "Pending" status can be edited.
            </p>
            <Link
              href={`/admin/orders/${orderId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                background: "#0077B6",
                color: "#FFF",
                borderRadius: "4px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              <ArrowLeft size={14} /> Back to Order Details
            </Link>
          </div>
        )}

        {order && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* ── TOP BAR: BACK BUTTON & TITLE ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "6px",
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link
                  href={`/admin/orders/${orderId}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    background: "#FFC107",
                    color: "#212529",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <ArrowLeft size={14} /> Back to Order
                </Link>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: textMain }}>
                  Edit Order #RNOD{order.id.replace(/\D/g, "") || order.id}
                </h3>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    background: "rgba(255, 193, 7, 0.15)",
                    color: "#D97706",
                    border: "1px solid #F59E0B",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  Status: Pending
                </span>
              </div>
            </div>

            {/* ── SECTION 1: CUSTOMER BASIC DETAILS ── */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: bgSubtle,
                  borderBottom: `1px solid ${border}`,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: textMain,
                }}
              >
                <UserIcon size={16} style={{ color: "#0077B6" }} />
                Customer Basic Details (Read-Only)
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "10px 16px", background: bgSubtle, color: textMuted, width: "12%" }}>Name</th>
                      <td style={{ padding: "10px 16px", fontWeight: 700, color: textMain, width: "21%" }}>{customerName}</td>
                      <th style={{ padding: "10px 16px", background: bgSubtle, color: textMuted, width: "12%" }}>Mobile</th>
                      <td style={{ padding: "10px 16px", fontWeight: 700, color: textMain, width: "21%" }}>+91 {customerPhone}</td>
                      <th style={{ padding: "10px 16px", background: bgSubtle, color: textMuted, width: "12%" }}>Email</th>
                      <td style={{ padding: "10px 16px", color: textMain, width: "22%" }}>{customerEmail}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "10px 16px", background: bgSubtle, color: textMuted }}>City</th>
                      <td style={{ padding: "10px 16px", color: textMain }}>{customerCity}</td>
                      <th style={{ padding: "10px 16px", background: bgSubtle, color: textMuted }}>State</th>
                      <td style={{ padding: "10px 16px", color: textMain }}>{customerState}</td>
                      <th style={{ padding: "10px 16px", background: bgSubtle, color: textMuted }}>Pincode</th>
                      <td style={{ padding: "10px 16px", fontWeight: 700, color: textMain }}>{customerPincode}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── SECTION 2: CATEGORY FILTER NAVBARS ── */}
            <div
              style={{
                background: isDark ? "#161B22" : "#E9ECEF",
                border: `1px solid ${border}`,
                borderRadius: "6px",
                padding: "10px 14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, marginRight: "6px" }}>
                Filter Catalogue:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedSubcategory("");
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: `1px solid ${selectedCategory === "" ? "#0077B6" : border}`,
                  background: selectedCategory === "" ? "#0077B6" : cardBg,
                  color: selectedCategory === "" ? "#FFF" : textMain,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                All Products
              </button>

              {categories.slice(0, 10).map((cat: any) => (
                <button
                  key={cat._id || cat.id || cat.name}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.name ? "" : cat.name);
                    setSelectedSubcategory("");
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "4px",
                    border: `1px solid ${selectedCategory === cat.name ? "#0077B6" : border}`,
                    background: selectedCategory === cat.name ? "#0077B6" : cardBg,
                    color: selectedCategory === cat.name ? "#FFF" : textMain,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* ── SECTION 3: SPLIT MAIN EDIT WORKSPACE ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "24px",
                alignItems: "start",
              }}
            >
              {/* ── LEFT COLUMN: PRODUCT CATALOGUE SEARCH & ADD TABLE ── */}
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: "6px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: textMain, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Package size={16} style={{ color: "#0077B6" }} /> Catalogue Product Selector
                  </h4>
                  <span style={{ fontSize: "12px", color: textMuted }}>
                    {productsList.length} items found
                  </span>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchProducts} style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Search product by name, SKU, article, or size..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        height: "38px",
                        padding: "0 12px 0 34px",
                        borderRadius: "4px",
                        border: `1px solid ${border}`,
                        background: isDark ? "#161B22" : "#FFF",
                        color: textMain,
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <Search
                      size={16}
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: textMuted,
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching}
                    style={{
                      padding: "0 16px",
                      height: "38px",
                      background: "#212529",
                      color: "#FFF",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: searching ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {searching ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Search / Filter"}
                  </button>
                </form>

                {/* Products Table */}
                <div style={{ overflowX: "auto", maxHeight: "560px", overflowY: "auto", border: `1px solid ${border}`, borderRadius: "4px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                    <thead style={{ position: "sticky", top: 0, background: bgSubtle, zIndex: 10 }}>
                      <tr style={{ borderBottom: `1px solid ${border}`, color: textMuted }}>
                        <th style={{ padding: "10px 12px", textAlign: "left" }}>Product</th>
                        <th style={{ padding: "10px 8px", textAlign: "center" }}>Art/Color</th>
                        <th style={{ padding: "10px 8px", textAlign: "center", width: "95px" }}>Price (₹)</th>
                        <th style={{ padding: "10px 8px", textAlign: "center", width: "65px" }}>Qty</th>
                        <th style={{ padding: "10px 10px", textAlign: "center", width: "70px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "36px 12px", textAlign: "center", color: textMuted }}>
                            {searching ? "Searching catalogue..." : "Enter keywords or select a category to find products to add."}
                          </td>
                        </tr>
                      ) : (
                        productsList.map((p) => {
                          const pKey = p._id || p.id || p.skuCode || p.name;
                          const currentInput = rowInputs[pKey] || {
                            price: Number(p.in_mrp || p.mrp || p.sellingPrice || p.price || 0),
                            quantity: 1,
                          };

                          return (
                            <tr key={pKey} style={{ borderBottom: `1px solid ${border}`, color: textMain }}>
                              <td style={{ padding: "8px 12px" }}>
                                <div style={{ fontWeight: 700 }}>{p.name}</div>
                                <div style={{ fontSize: "11px", color: textMuted }}>
                                  {p.size ? `${p.size} • ` : ""}{p.skuCode || p.code || "—"} {p.subcategoryName ? `(${p.subcategoryName})` : ""}
                                </div>
                              </td>
                              <td style={{ padding: "8px 8px", textAlign: "center", fontSize: "11.5px" }}>
                                <div>{p.article || "—"}</div>
                                <div style={{ color: textMuted }}>{p.colorName || "Standard"}</div>
                              </td>
                              <td style={{ padding: "8px 8px", textAlign: "center" }}>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={currentInput.price}
                                  onChange={(e) =>
                                    setRowInputs({
                                      ...rowInputs,
                                      [pKey]: { ...currentInput, price: parseFloat(e.target.value) || 0 },
                                    })
                                  }
                                  style={{
                                    width: "80px",
                                    height: "30px",
                                    textAlign: "center",
                                    borderRadius: "3px",
                                    border: `1px solid ${border}`,
                                    background: isDark ? "#161B22" : "#FFF",
                                    color: textMain,
                                    fontSize: "12px",
                                    fontWeight: 700,
                                  }}
                                />
                              </td>
                              <td style={{ padding: "8px 8px", textAlign: "center" }}>
                                <input
                                  type="number"
                                  min="1"
                                  value={currentInput.quantity}
                                  onChange={(e) =>
                                    setRowInputs({
                                      ...rowInputs,
                                      [pKey]: { ...currentInput, quantity: parseInt(e.target.value, 10) || 1 },
                                    })
                                  }
                                  style={{
                                    width: "55px",
                                    height: "30px",
                                    textAlign: "center",
                                    borderRadius: "3px",
                                    border: `1px solid ${border}`,
                                    background: isDark ? "#161B22" : "#FFF",
                                    color: textMain,
                                    fontSize: "12px",
                                    fontWeight: 700,
                                  }}
                                />
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => handleAddItem(p)}
                                  style={{
                                    padding: "5px 12px",
                                    background: "#0077B6",
                                    color: "#FFF",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <Plus size={12} /> Add
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── RIGHT COLUMN: ACTIVE ORDER CART & SETTINGS FORM ── */}
              <form
                onSubmit={handleSaveOrder}
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: "6px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: textMain, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Tag size={16} style={{ color: "#0077B6" }} /> Order Cart Items ({items.length})
                  </h4>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#059669" }}>
                    Subtotal: ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Cart Items Table */}
                <div style={{ overflowX: "auto", border: `1px solid ${border}`, borderRadius: "4px", maxHeight: "240px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead style={{ position: "sticky", top: 0, background: bgSubtle, zIndex: 5 }}>
                      <tr style={{ borderBottom: `1px solid ${border}`, color: textMuted }}>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Article</th>
                        <th style={{ padding: "8px 6px", textAlign: "center", width: "110px" }}>Qty</th>
                        <th style={{ padding: "8px 6px", textAlign: "right" }}>Price</th>
                        <th style={{ padding: "8px 6px", textAlign: "right" }}>Total</th>
                        <th style={{ padding: "8px 6px", textAlign: "center", width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "24px 10px", textAlign: "center", color: textMuted }}>
                            No items in cart. Use the selector on the left to add products.
                          </td>
                        </tr>
                      ) : (
                        items.map((item, idx) => (
                          <tr key={`${item.code}-${idx}`} style={{ borderBottom: `1px solid ${border}`, color: textMain }}>
                            <td style={{ padding: "8px 10px" }}>
                              <div style={{ fontWeight: 700 }}>{item.name}</div>
                              <div style={{ fontSize: "11px", color: textMuted }}>
                                {item.size ? `${item.size} • ` : ""}{item.code || "—"} {item.color ? `(${item.color})` : ""}
                              </div>
                            </td>
                            <td style={{ padding: "8px 6px", textAlign: "center" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${border}`, borderRadius: "4px", overflow: "hidden" }}>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(idx, -1)}
                                  style={{
                                    width: "24px",
                                    height: "26px",
                                    background: "#DC3545",
                                    color: "#FFF",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Minus size={11} />
                                </button>
                                <span style={{ width: "32px", textAlign: "center", fontWeight: 700, fontSize: "12px" }}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(idx, 1)}
                                  style={{
                                    width: "24px",
                                    height: "26px",
                                    background: "#198754",
                                    color: "#FFF",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600 }}>
                              ₹{item.price}
                            </td>
                            <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 800, color: textMain }}>
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </td>
                            <td style={{ padding: "8px 6px", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                title="Remove item"
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#DC3545",
                                  cursor: "pointer",
                                  padding: "2px",
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── ORDER FINANCIALS & SETTINGS FORM ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  {/* Shipping Charges */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontWeight: 700, color: textMain, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Truck size={14} style={{ color: "#0077B6" }} /> Shipping Charges (+)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={shippingAmount}
                      onChange={(e) => setShippingAmount(parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: "4px",
                        border: `1px solid ${border}`,
                        background: isDark ? "#161B22" : "#FFF",
                        color: textMain,
                        fontSize: "13px",
                        fontWeight: 700,
                        textAlign: "right",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Discount */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Tag size={14} /> Discount (-)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      style={{
                        width: "100%",
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: "4px",
                        border: `1px solid ${border}`,
                        background: isDark ? "#161B22" : "#FFF",
                        color: "#059669",
                        fontSize: "13px",
                        fontWeight: 700,
                        textAlign: "right",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Shipping Address Selection */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontWeight: 700, color: textMain, display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={14} style={{ color: "#0077B6" }} /> Shipping Address
                    </label>
                    <select
                      value={selectedAddressIndex}
                      onChange={(e) => handleSelectAddress(parseInt(e.target.value, 10))}
                      style={{
                        width: "100%",
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: "4px",
                        border: `1px solid ${border}`,
                        background: isDark ? "#161B22" : "#FFF",
                        color: textMain,
                        fontSize: "12.5px",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      {addressOptions.map((addr, aIdx) => (
                        <option key={aIdx} value={aIdx}>
                          {addr.address ? `${addr.address.slice(0, 30)}... (${addr.pinCode})` : `Address #${aIdx + 1} (${addr.phone || "No Phone"})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Terms */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontWeight: 700, color: textMain, display: "flex", alignItems: "center", gap: "6px" }}>
                      <CreditCard size={14} style={{ color: "#0077B6" }} /> Payment Terms
                    </label>
                    <select
                      value={paymentTerm}
                      onChange={(e) => setPaymentTerm(e.target.value)}
                      style={{
                        width: "100%",
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: "4px",
                        border: `1px solid ${border}`,
                        background: isDark ? "#161B22" : "#FFF",
                        color: textMain,
                        fontSize: "12.5px",
                        fontWeight: 700,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="100% Advanced">100% Advanced</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>

                  {/* Note / Remarks */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "10px", alignItems: "start" }}>
                    <label style={{ fontWeight: 700, color: textMain, paddingTop: "8px" }}>
                      Note / Remarks (opt)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add internal order remarks..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "4px",
                        border: `1px solid ${border}`,
                        background: isDark ? "#161B22" : "#FFF",
                        color: textMain,
                        fontSize: "12.5px",
                        fontFamily: "inherit",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* ── GRAND TOTAL CARD ── */}
                <div
                  style={{
                    background: bgSubtle,
                    border: `1px solid ${border}`,
                    borderRadius: "6px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: textMuted, textTransform: "uppercase", fontWeight: 700 }}>
                      Final Total Amount
                    </div>
                    <div style={{ fontSize: "11.5px", color: textMuted }}>
                      Subtotal (₹{subtotal}) + Ship (₹{shippingAmount}) - Disc (₹{discountAmount})
                    </div>
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#0077B6" }}>
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* ── SAVE BUTTON ── */}
                <button
                  type="submit"
                  disabled={isSaving || saveSuccess || items.length === 0}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    background: saveSuccess ? "#198754" : isSaving ? "#6B7280" : "#212529",
                    color: "#FFF",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: isSaving || items.length === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 size={16} /> Order Saved! Redirecting...
                    </>
                  ) : isSaving ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving Order...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Order
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
