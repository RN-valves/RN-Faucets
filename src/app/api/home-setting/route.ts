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
      src: "/api/media/website/home/hero/0.mp4",
      title: "RN LUXURY\nCollection Faucets",
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
        href: "/terms-conditions",
      },
      {
        title: "Simple returns - Return your order within 7 days*.",
        description: "Benefit from our 7 day return policy.",
        linkLabel: "See Terms",
        href: "/return-refund-policy",
      },
      {
        title: "Professional Installation - RN Faucets approved installation available*.",
        description: "Benefit from professional brand installation services.",
        linkLabel: "Find Out More",
        href: "/contact-us",
      },
      {
        title: "Assistance from RN Faucets specialists, Live Chat.",
        description: "Live chat with RN Faucets product specialist and find your right product.",
        linkLabel: "Contact Us",
        href: "/contact-us",
      },
    ],
  },
  reelsSection: {
    visible: true,
    profileUrl: "https://www.instagram.com/rnvalvesandfaucets/",
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
        image: "/uploads/support/store-locator.webp",
        overlay: "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.58) 28%, rgba(0,0,0,0.14) 60%, rgba(0,0,0,0.06) 100%)",
      },
      {
        title: "RN Care",
        description: "Expert support. Trusted Service. Industry leading warranty.",
        cta: "Let's Connect",
        href: "/contact-us",
        image: "/uploads/support/rn-care.webp",
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
    visible: false,
    items: [],
  },
  footer: {
    logo: "https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg",
    address: "B-68 SITE-4 SAHIBABAD, Ghaziabad\nUttar Pradesh 201010, India",
    phone: "1800 12340 0400",
    email1: "enquiry@rnvalves.com",
    email2: "enquiry@rnvalves.com",
    copyrightText: "© Copyright | RN Valves & Faucets | All Rights Reserved",
    col1Links: [
      { label: "About Us", href: "/about-us" },
      { label: "Blogs", href: "/blogs" },
      { label: "Catalogues", href: "/catalogues" },
      { label: "Our CSR", href: "/corporate-social-responsibility" },
    ],
    col2Links: [
      { label: "Become our Dealer", href: "/business-user-registration" },
      { label: "Our Certification", href: "/certificates" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Warranty Policy", href: "/about-us" },
    ],
    col3Links: [
      { label: "Personal Account", href: "/retail-user-registration" },
      { label: "Business Account", href: "/business-user-registration" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Return & Refund Policy", href: "/return-refund-policy" },
      { label: "Terms & Conditions", href: "/terms-conditions" },
    ],
    socials: [
      { label: "Instagram", href: "https://www.instagram.com/rnvalvesandfaucets/" },
      { label: "Facebook", href: "https://www.facebook.com/rnvalvesandfaucets/" },
      { label: "Youtube", href: "https://www.youtube.com/channel/UCpUUF6ZFL88S85IuSsHDRSQ/?sub_confirmation=1" },
      { label: "Linkedin", href: "https://www.linkedin.com/company/rn-valves-faucets/" },
      { label: "Twitter X", href: "https://twitter.com/RNValves" },
      { label: "Pinterest", href: "https://in.pinterest.com/infornvalves/" },
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

import { requireAdminAuth } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const adminSession = await requireAdminAuth(req);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required to update settings." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const { _id, createdAt, updatedAt, ...updateData } = body;

    const setting = await HomeSetting.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: false }
    );

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    console.error("POST /api/home-setting error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
