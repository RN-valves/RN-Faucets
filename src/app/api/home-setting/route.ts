import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HomeSetting from "@/models/HomeSetting";

const DEFAULT_HOME_SETTINGS = {
  header: {
    logo: "https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg",
    menuLinks: [
      { label: "About Us", href: "/about-us" },
      { label: "Catalogues", href: "/admin/catalogues" },
      { label: "Find Dealers", href: "#" },
      { label: "Become A Channel Partner", href: "#" },
      { label: "Customer Portal", href: "#" },
      { label: "Blogs", href: "#" },
      { label: "Events", href: "#" },
      { label: "Our Projects", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Career", href: "#" },
      { label: "Newsletter", href: "#" },
      { label: "Digital Gallery", href: "#" },
    ],
  },
  hero: [
    {
      id: 0,
      type: "video",
      src: "https://rnvalves.media/Catalogue/bannerVideo4.mp4",
      title: "RN Italian\nCollection Faucets",
      subtitle: "Explore",
      duration: 5000,
      active: true,
      order: 1,
    },
    {
      id: 1,
      type: "video",
      src: "/videos/hero-1.mp4",
      title: "Luxury Bath\nCollection",
      subtitle: "Experience",
      duration: 5000,
      active: true,
      order: 2,
    },
    {
      id: 2,
      type: "image",
      src: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fd6f29531-45cd-41d2-a009-f59dcf820662.png&w=3840&q=75",
      title: "Obsidian\nBath Series",
      subtitle: "Discover",
      duration: 5000,
      active: true,
      order: 3,
    },
    {
      id: 3,
      type: "image",
      src: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F1ba8187d-97fb-486b-ba1b-69922db73b9e.png&w=3840&q=75",
      title: "Aurum\nEdition",
      subtitle: "Curated",
      duration: 5000,
      active: true,
      order: 4,
    },
  ],
  spaceShowcase: {
    visible: true,
    image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FBathroom-1756100455419-1756463985636.webp&w=3840&q=75",
    subtitle: "Explore by Space",
    title: "Bathroom",
  },
  categoriesSection: {
    visible: true,
    title: "Explore Product\nCategories",
    description: "Top-rated, best-selling products trusted and loved by our customers.",
    categories: [
      {
        id: 0,
        name: "Wash Basins",
        subtitle: "Beautifully engineered basins for every bathroom style",
        href: "/wash-basins",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fe6628fa2-ac78-4b19-a704-4b441cd6ddaa.png&w=1200&q=75",
      },
      {
        id: 1,
        name: "Faucets",
        subtitle: "Precision engineering with timeless style",
        href: "/faucets",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F894ffe93-b067-44c2-b45d-455047b4448b.png&w=1200&q=75",
      },
      {
        id: 2,
        name: "Showers",
        subtitle: "Indulgent shower experiences for a premium lifestyle",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F00fb3464-ede4-477a-a0a5-1f00cf80aac3.png&w=1200&q=75",
      },
      {
        id: 3,
        name: "Water Closets",
        subtitle: "Hygienic, modern closets built for comfort",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fproducts%2Fffce0ec1-9d9b-42a0-af1d-7e179eed4aa3.png&w=1200&q=75",
      },
      {
        id: 4,
        name: "Smart Appliances",
        subtitle: "Intelligent home appliances redefining convenience",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fdb1b8c16-b65b-4293-bc97-c6f1b510b42d.webp&w=1200&q=75",
      },
      {
        id: 5,
        name: "Air Coolers",
        subtitle: "Energy-efficient cooling for every Indian home",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FWebsite-Homepage-Banners-640x990px-optimus-iPro-BLDC-Blk-1761904192697-1762151279642.webp&w=1920&q=75",
      },
    ],
  },
  bestSellersSection: {
    visible: true,
    title: "New\nArrivals",
    description: "Discover our latest precision-engineered designs and innovative bath fittings.",
    products: [
      {
        id: 0,
        name: "Obsidian Deck Mounted Faucet",
        price: "₹18,490",
        sku: "HW-FAU-OBS-01",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F894ffe93-b067-44c2-b45d-455047b4448b.png&w=1200&q=75",
      },
      {
        id: 1,
        name: "Rainfall Overhead Shower",
        price: "₹24,990",
        sku: "HW-SHW-RF-02",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F00fb3464-ede4-477a-a0a5-1f00cf80aac3.png&w=1200&q=75",
      },
      {
        id: 2,
        name: "Aura Wall Hung Closet",
        price: "₹32,750",
        sku: "HW-WC-AUR-03",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fffce0ec1-9d9b-42a0-af1d-7e179eed4aa3.png&w=1200&q=75",
      },
      {
        id: 3,
        name: "Smart Kitchen Chimney",
        price: "₹28,999",
        sku: "HW-APP-CHM-04",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fdb1b8c16-b65b-4293-bc97-c6f1b510b42d.webp&w=1200&q=75",
      },
      {
        id: 4,
        name: "Optimus iPro BLDC Cooler",
        price: "₹21,490",
        sku: "HW-CLR-OPT-05",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FWebsite-Homepage-Banners-640x990px-optimus-iPro-BLDC-Blk-1761904192697-1762151279642.webp&w=1920&q=75",
      },
      {
        id: 5,
        name: "Ceramic Counter Wash Basin",
        price: "₹12,890",
        sku: "HW-BAS-CER-06",
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fe6628fa2-ac78-4b19-a704-4b441cd6ddaa.png&w=1200&q=75",
      },
    ],
  },
  whyBuySection: {
    visible: true,
    heading: "Why Buy from RN Faucets Directly",
    items: [
      {
        title: "Free and fast delivery. Same day dispatch*.",
        description: "Enjoy fast, free delivery with same-day dispatch for an enhanced shopping experience.",
        linkLabel: "See Terms",
        href: "#",
      },
      {
        title: "Simple returns - Return your order within 7 days*.",
        description: "Benefit from our 7 day return policy.",
        linkLabel: "See Terms",
        href: "#",
      },
      {
        title: "Professional Installation - RN Faucets approved installation available*.",
        description: "Benefit from professional brand installation services.",
        linkLabel: "Find Out More",
        href: "#",
      },
      {
        title: "Assistance from RN Faucets specialists, Live Chat.",
        description: "Live chat with RN Faucets product specialist and find your right product.",
      },
    ],
  },
  reelsSection: {
    visible: true,
    profileUrl: "https://www.instagram.com/rn_valves/",
    reels: [
      { video: "/Insta-Reels/reel-1.mp4", instagram: "https://www.instagram.com/reel/DYmKS6VIlS4/" },
      { video: "/Insta-Reels/reel-2.mp4", instagram: "https://www.instagram.com/reel/DZUHQ1aIY-e/" },
      { video: "/Insta-Reels/reel-3.mp4", instagram: "https://www.instagram.com/reel/DbIlkbKIXlh/" },
      { video: "/Insta-Reels/reel-4.mp4", instagram: "https://www.instagram.com/reel/DZreP5goV6Y/" },
      { video: "/Insta-Reels/reel-5.mp4", instagram: "https://www.instagram.com/reel/DTDHr6qlTgE/" },
      { video: "/Insta-Reels/reel-6.mp4", instagram: "https://www.instagram.com/reel/DQ6oBoxkYDN/" },
      { video: "/Insta-Reels/reel-7.mp4", instagram: "https://www.instagram.com/reel/DSH60G0j4YT/" },
    ],
  },
  supportCardsSection: {
    visible: true,
    cards: [
      {
        title: "Store Locator",
        description: "Purchase our products from RN Faucets authorized dealers only.",
        cta: "Find a Store",
        href: "#",
        image: "https://www.jaquar.com/Themes/Jaquar2025_V1/Content/images/store-loacter-img_2026.webp",
        overlay: "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.58) 28%, rgba(0,0,0,0.14) 60%, rgba(0,0,0,0.06) 100%)",
      },
      {
        title: "RN Care",
        description: "Expert support. Trusted Service. Industry leading warranty.",
        cta: "Let's Connect",
        href: "#",
        image: "https://www.jaquar.com/Themes/Jaquar2025_V1/Content/images/jaquar-care_2026.webp",
        overlay: "linear-gradient(90deg, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.7) 34%, rgba(0,0,0,0.2) 68%, rgba(0,0,0,0.08) 100%)",
      },
    ],
  },
  blogsSection: {
    visible: true,
    title: "Blogs",
    viewAllHref: "#",
    blogs: [
      {
        title: "Designer Wash Basin Trends for Small Bathrooms in 2026",
        href: "#",
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20small%20bathroom%20interior%20with%20designer%20white%20wash%20basin%2C%20modern%20chrome%20faucet%2C%20warm%20ambient%20lighting%2C%20premium%20dark%20stone%20wall%2C%20realistic%20editorial%20interior%20photography%2C%20high-end%20home%20design&image_size=landscape_16_9",
      },
      {
        title: "Elegant Bedroom Wall Tile Ideas to Suit Every Style",
        href: "#",
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=contemporary%20luxury%20bedroom%20with%20large%20marble%20accent%20wall%20tiles%2C%20soft%20natural%20light%2C%20floor-to-ceiling%20window%2C%20minimal%20premium%20furniture%2C%20realistic%20interior%20photography&image_size=landscape_16_9",
      },
      {
        title: "Creative Kitchen Chimney Design Ideas for Your Home",
        href: "#",
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20kitchen%20interior%20with%20sleek%20black%20chimney%20hood%2C%20white%20brick%20wall%2C%20minimal%20cabinetry%2C%20clean%20premium%20appliance%20showcase%2C%20realistic%20interior%20photography&image_size=landscape_16_9",
      },
      {
        title: "Premium Faucet Finishes That Instantly Elevate Your Bathroom",
        href: "#",
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20bathroom%20countertop%20with%20brushed%20gold%20designer%20faucet%2C%20stone%20sink%2C%20soft%20luxury%20lighting%2C%20high-end%20interior%20editorial%20photography&image_size=landscape_16_9",
      },
      {
        title: "How to Choose Tiles That Make Compact Spaces Feel Bigger",
        href: "#",
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=bright%20compact%20modern%20interior%20with%20large-format%20light%20tiles%2C%20spacious%20feel%2C%20minimal%20furnishings%2C%20realistic%20architectural%20interior%20photography&image_size=landscape_16_9",
      },
    ],
  },
  supportLinksSection: {
    visible: true,
    items: [
      {
        title: "Institutional Business",
        description: "Explore Projects for Institutional & Business Customers",
        cta: "Know More",
        href: "#",
        iconName: "Building2",
      },
      {
        title: "International Business",
        description: "Explore the countries we operate in",
        cta: "Know More",
        href: "#",
        iconName: "Globe",
      },
      {
        title: "Service & Support",
        description: "Connect with us for Installation and Service Request",
        cta: "Connect Now",
        href: "#",
        iconName: "Headset",
      },
      {
        title: "Download RN Faucets App",
        description: "Download Now",
        cta: "",
        href: "#",
        iconName: "Smartphone",
      },
    ],
  },
  footer: {
    logo: "https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg",
    address: "B-68 SITE-4 SAHIBABAD, Ghaziabad\nUttar Pradesh 201010, India",
    phone: "1800 212 0192",
    email1: "info@rnvalves.com",
    email2: "support@rnvalves.com",
    copyrightText: "© Copyright | RN Valves & Faucets | All Rights Reserved",
    col1Links: [
      { label: "About Us", href: "/about-us" },
      { label: "Blogs", href: "#" },
      { label: "Tutorials Videos", href: "#" },
      { label: "Projects", href: "#" },
    ],
    col2Links: [
      { label: "Career", href: "#" },
      { label: "Events", href: "#" },
      { label: "Warranty", href: "#" },
      { label: "Catalogues", href: "#" },
    ],
    col3Links: [
      { label: "Become a Channel Partner", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Youtube", href: "https://youtube.com" },
      { label: "Linkedin", href: "https://linkedin.com" },
      { label: "Twitter X", href: "https://twitter.com" },
      { label: "Pinterest", href: "https://pinterest.com" },
    ],
  },
};

export async function GET() {
  try {
    await connectDB();
    let setting = await HomeSetting.findOne();
    if (!setting) {
      setting = DEFAULT_HOME_SETTINGS;
    }
    return NextResponse.json(setting);
  } catch (error) {
    console.error("GET /api/home-setting error:", error);
    return NextResponse.json(DEFAULT_HOME_SETTINGS);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    let setting = await HomeSetting.findOne();
    if (setting) {
      Object.assign(setting, body);
      await setting.save();
    } else {
      setting = await HomeSetting.create(body);
    }

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    console.error("POST /api/home-setting error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
