export type NetworkPinType = "head" | "branch" | "depot" | "manufacturing";

export type NetworkLocation = {
  id: string;
  city: string;
  type: NetworkPinType;
  label: string;
  /** Percentage position on map (0–100) */
  x: number;
  y: number;
};

export const NETWORK_LOCATIONS: NetworkLocation[] = [
  {
    id: "delhi",
    city: "Delhi",
    type: "head",
    label: "National Headquarters",
    x: 32.52,
    y: 28.52,
  },
  {
    id: "haridwar",
    city: "Haridwar",
    type: "manufacturing",
    label: "North India Production Hub",
    x: 35.53,
    y: 24.14,
  },
  {
    id: "jaipur",
    city: "Jaipur",
    type: "manufacturing",
    label: "Western Manufacturing Hub",
    x: 28.03,
    y: 34.03,
  },
  {
    id: "ahmedabad",
    city: "Ahmedabad",
    type: "manufacturing",
    label: "Gujarat Production Facility",
    x: 17.89,
    y: 46.33,
  },
  {
    id: "hyderabad",
    city: "Hyderabad",
    type: "manufacturing",
    label: "South India Production Hub",
    x: 36.54,
    y: 63.56,
  },
  {
    id: "chennai",
    city: "Chennai",
    type: "manufacturing",
    label: "Coastal Manufacturing Unit",
    x: 42.17,
    y: 76.34,
  },
  {
    id: "gujarat",
    city: "Gujarat",
    type: "branch",
    label: "West Region Branch",
    x: 17.89,
    y: 48.7,
  },
  {
    id: "pune",
    city: "Pune",
    type: "branch",
    label: "West Region Branch",
    x: 21.95,
    y: 60.14,
  },
  {
    id: "patna",
    city: "Patna",
    type: "branch",
    label: "East Region Branch",
    x: 57.52,
    y: 38.24,
  },
  {
    id: "kolkata",
    city: "Kolkata",
    type: "branch",
    label: "East Region Branch",
    x: 67.69,
    y: 47.73,
  },
  {
    id: "mumbai",
    city: "Mumbai",
    type: "depot",
    label: "West India Warehouse Hub",
    x: 18.86,
    y: 58.46,
  },
  {
    id: "nagpur",
    city: "Nagpur",
    type: "depot",
    label: "Central Distribution Depot",
    x: 38.44,
    y: 52.14,
  },
  {
    id: "bhubaneshwar",
    city: "Bhubaneshwar",
    type: "depot",
    label: "East India Warehouse Hub",
    x: 59.68,
    y: 54.74,
  },
  {
    id: "guwahati",
    city: "Guwahati",
    type: "depot",
    label: "Northeast Logistics Hub",
    x: 78.32,
    y: 36.49,
  },
  {
    id: "palakkad",
    city: "Palakkad",
    type: "depot",
    label: "South India Warehouse Hub",
    x: 30.77,
    y: 83.07,
  },
];

export const TYPE_META: Record<
  NetworkPinType,
  { title: string; pinClass: string; glow: string }
> = {
  head: {
    title: "Head Office",
    pinClass: "from-[#0B3B6E] to-[#1D4ED8]",
    glow: "shadow-[0_0_22px_rgba(29,78,216,0.45)]",
  },
  branch: {
    title: "Branch Office",
    pinClass: "from-[#38BDF8] to-[#0284C7]",
    glow: "shadow-[0_0_18px_rgba(14,165,233,0.4)]",
  },
  depot: {
    title: "Depot / Warehouse",
    pinClass: "from-[#64748B] to-[#1E293B]",
    glow: "shadow-[0_0_16px_rgba(30,41,59,0.35)]",
  },
  manufacturing: {
    title: "Manufacturing Unit",
    pinClass: "from-[#F87171] to-[#B91C1C]",
    glow: "shadow-[0_0_20px_rgba(185,28,28,0.4)]",
  },
};

/** Major hub pairs for dotted connection lines (ids) */
export const CONNECTION_PAIRS: [string, string][] = [
  ["delhi", "jaipur"],
  ["delhi", "haridwar"],
  ["delhi", "patna"],
  ["jaipur", "ahmedabad"],
  ["ahmedabad", "mumbai"],
  ["mumbai", "pune"],
  ["pune", "nagpur"],
  ["nagpur", "hyderabad"],
  ["hyderabad", "chennai"],
  ["hyderabad", "palakkad"],
  ["patna", "kolkata"],
  ["kolkata", "bhubaneshwar"],
  ["kolkata", "guwahati"],
  ["delhi", "nagpur"],
];
