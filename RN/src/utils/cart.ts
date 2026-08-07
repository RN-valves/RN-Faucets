export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  quantity: number;
}

const CART_KEY = "hindware_cart_items";

// Helper to get cart items from localStorage
export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(CART_KEY);
  if (stored === null) {
    // If cart is empty, initialize with default mockup item so it matches screenshot by default
    const defaultItem: CartItem = {
      id: "automate-toilet-floor",
      name: "Automate Smart Toilet- Floor Mount",
      price: 239890,
      image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FF410011GRT_thumbnail.png&w=2048&q=75",
      color: "Star White",
      quantity: 1
    };
    return [defaultItem];
  }
  try {
    return JSON.parse(stored);
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
  const existing = items.find((i) => i.id === item.id && i.color === item.color);
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
