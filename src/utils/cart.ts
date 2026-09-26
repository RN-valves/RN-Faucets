export interface CartItem {
  id: string;
  name: string;
  code?: string;
  price: number;
  image: string;
  color: string;
  size?: string;
  quantity: number;
}

const CART_KEY = "rn_cart_items";

// Helper to get cart items from localStorage
export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(CART_KEY);
  if (stored === null) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((i: any) => ({
      ...i,
      quantity: typeof i.quantity === "number" && i.quantity > 0 ? i.quantity : 1,
    }));
  } catch {
    return [];
  }
}

// Helper to save cart items to localStorage
export function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

// Helper to add an item
export function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
  const items = getCartItems();
  const existing = items.find(
    (i) => i.id === item.id && i.color === item.color && (i.size || "") === (item.size || "")
  );
  if (existing) {
    existing.quantity += (item.quantity ?? 1);
  } else {
    items.push({
      ...item,
      quantity: item.quantity ?? 1
    });
  }
  saveCartItems(items);
}

// Helper to remove an item
export function removeFromCart(id: string, color: string) {
  const items = getCartItems();
  const updated = items.filter((i) => !(i.id === id && i.color === color));
  saveCartItems(updated);
}

// Helper to update quantity
export function updateCartQuantity(id: string, color: string, quantity: number) {
  const items = getCartItems();
  const item = items.find((i) => i.id === id && i.color === color);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCartItems(items);
  }
}
