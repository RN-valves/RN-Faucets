import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HomeSetting from "@/models/HomeSetting";

const DEFAULT_HOME_SETTINGS = {
  header: {
    logo: "https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg",
    menuLinks: [
      { label: "About Us", href: "/about-us" },
      { label: "Catalogues", href: "/catalogues" },
      { label: "Become A Channel Partner", href: "/business-user-registration" },
      { label: "Blogs", href: "/blogs" },
      { label: "Contact Us", href: "/contact-us" },
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
      src: "/api/media/website/catalogue/categories/cat-cp-faucets/banner.webp",
      title: "RN Premium\nBath Series",
      subtitle: "Discover",
      duration: 5000,
      active: true,
      order: 3,
    },
    {
      id: 3,
      type: "image",
      src: "/api/media/website/catalogue/categories/cat-ptmt-faucets/banner.webp",
      title: "RN Polymer\nCollection",
      subtitle: "Curated",
      duration: 5000,
      active: true,
      order: 4,
    },
  ],
  spaceShowcase: {
    visible: true,
    image: "/api/media/website/catalogue/categories/cat-cp-faucets/banner.webp",
    subtitle: "Explore by Space",
    title: "Bathroom",
  },
  categoriesSection: {
    visible: true,
    title: "Explore Product\nCategories",
    description: "Top-rated, best-selling products trusted and loved by our customers.",
    categories: [],
  },
  bestSellersSection: {
    visible: true,
    title: "New\nArrivals",
    description: "Discover our latest precision-engineered designs and innovative bath fittings.",
    products: [],
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
        href: "/store-locator",
        image: "https://www.jaquar.com/Themes/Jaquar2025_V1/Content/images/store-loacter-img_2026.webp",
        overlay: "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.58) 28%, rgba(0,0,0,0.14) 60%, rgba(0,0,0,0.06) 100%)",
      },
      {
        title: "RN Care",
        description: "Expert support. Trusted Service. Industry leading warranty.",
        cta: "Let's Connect",
        href: "/contact-us",
        image: "https://www.jaquar.com/Themes/Jaquar2025_V1/Content/images/jaquar-care_2026.webp",
        overlay: "linear-gradient(90deg, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.7) 34%, rgba(0,0,0,0.2) 68%, rgba(0,0,0,0.08) 100%)",
      },
    ],
  },
  blogsSection: {
    visible: true,
    title: "Blogs",
    viewAllHref: "/blogs",
    blogs: [],
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
      { label: "Blogs", href: "/blogs" },
      { label: "Catalogues", href: "/catalogues" },
    ],
    col2Links: [
      { label: "Become a Channel Partner", href: "/business-user-registration" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Warranty Policy", href: "/about-us" },
      { label: "Tutorials Videos", href: "#" },
    ],
    col3Links: [
      { label: "Personal Account", href: "/retail-user-registration" },
      { label: "Business Account", href: "/business-user-registration" },
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
