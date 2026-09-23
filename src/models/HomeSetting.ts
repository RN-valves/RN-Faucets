import mongoose, { Schema, Document } from "mongoose";

export interface IHomeSetting extends Document {
  header: {
    logo: string;
    menuLinks: Array<{ label: string; href: string }>;
  };
  hero: Array<{
    id: number;
    type: "video" | "image";
    src: string;
    title: string;
    subtitle: string;
    duration?: number;
    active?: boolean;
    order?: number;
  }>;
  spaceShowcase: {
    visible: boolean;
    image: string;
    subtitle: string;
    title: string;
  };
  categoriesSection: {
    visible: boolean;
    title: string;
    description: string;
    categories: Array<{
      id: number;
      name: string;
      subtitle: string;
      image: string;
      href?: string;
    }>;
  };
  bestSellersSection: {
    visible: boolean;
    title: string;
    description: string;
    products: Array<{
      id: number;
      name: string;
      price: string;
      sku: string;
      image: string;
    }>;
  };
  whyBuySection: {
    visible: boolean;
    heading: string;
    items: Array<{
      title: string;
      description: string;
      linkLabel?: string;
      href?: string;
    }>;
  };
  reelsSection: {
    visible: boolean;
    profileUrl: string;
    reels: Array<{
      video: string;
      instagram: string;
    }>;
  };
  supportCardsSection: {
    visible: boolean;
    cards: Array<{
      title: string;
      description: string;
      cta: string;
      href: string;
      image: string;
      overlay?: string;
    }>;
  };
  blogsSection: {
    visible: boolean;
    title: string;
    viewAllHref: string;
    blogs: Array<{
      title: string;
      image: string;
      href: string;
    }>;
  };
  supportLinksSection: {
    visible: boolean;
    items: Array<{
      title: string;
      description: string;
      cta: string;
      href: string;
      iconName: string;
    }>;
  };
  footer: {
    logo: string;
    address: string;
    phone: string;
    email1: string;
    email2: string;
    copyrightText: string;
    col1Links: Array<{ label: string; href: string }>;
    col2Links: Array<{ label: string; href: string }>;
    col3Links: Array<{ label: string; href: string }>;
    socials: Array<{ label: string; href: string }>;
  };
  updatedAt: Date;
}

const HomeSettingSchema = new Schema<IHomeSetting>(
  {
    header: {
      logo: { type: String, default: "https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg" },
      menuLinks: [
        {
          label: { type: String },
          href: { type: String },
        },
      ],
    },
    hero: [
      {
        id: { type: Number },
        type: { type: String, enum: ["video", "image"], default: "image" },
        src: { type: String },
        title: { type: String },
        subtitle: { type: String },
        duration: { type: Number, default: 5000 },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],
    spaceShowcase: {
      visible: { type: Boolean, default: true },
      image: { type: String, default: "/api/media/website/home/showcase/space-bathroom.webp" },
      subtitle: { type: String, default: "Explore by Space" },
      title: { type: String, default: "Bathroom" },
    },
    categoriesSection: {
      visible: { type: Boolean, default: true },
      title: { type: String, default: "Explore Product\nCategories" },
      description: { type: String, default: "Top-rated, best-selling products trusted and loved by our customers." },
      categories: [
        {
          id: { type: Schema.Types.Mixed },
          name: { type: String },
          subtitle: { type: String },
          image: { type: String },
          href: { type: String },
        },
      ],
    },
    bestSellersSection: {
      visible: { type: Boolean, default: true },
      title: { type: String, default: "New\nArrivals" },
      description: { type: String, default: "Discover our latest precision-engineered designs and innovative bath fittings." },
      products: [
        {
          id: { type: Schema.Types.Mixed },
          name: { type: String },
          price: { type: String },
          sku: { type: String },
          image: { type: String },
        },
      ],
    },
    whyBuySection: {
      visible: { type: Boolean, default: true },
      heading: { type: String, default: "Why Buy from RN Faucets Directly" },
      items: [
        {
          title: { type: String },
          description: { type: String },
          linkLabel: { type: String },
          href: { type: String },
        },
      ],
    },
    reelsSection: {
      visible: { type: Boolean, default: true },
      profileUrl: { type: String, default: "https://www.instagram.com/rnvalvesandfaucets/" },
      reels: [
        {
          video: { type: String },
          instagram: { type: String },
        },
      ],
    },
    supportCardsSection: {
      visible: { type: Boolean, default: true },
      cards: [
        {
          title: { type: String },
          description: { type: String },
          cta: { type: String },
          href: { type: String },
          image: { type: String },
          overlay: { type: String },
        },
      ],
    },
    blogsSection: {
      visible: { type: Boolean, default: true },
      title: { type: String, default: "Blogs" },
      viewAllHref: { type: String, default: "/blogs" },
      blogs: [
        {
          title: { type: String },
          image: { type: String },
          href: { type: String },
        },
      ],
    },
    supportLinksSection: {
      visible: { type: Boolean, default: true },
      items: [
        {
          title: { type: String },
          description: { type: String },
          cta: { type: String },
          href: { type: String },
          iconName: { type: String },
        },
      ],
    },
    footer: {
      logo: { type: String, default: "https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg" },
      address: { type: String, default: "B-68 SITE-4 SAHIBABAD, Ghaziabad\nUttar Pradesh 201010, India" },
      phone: { type: String, default: "1800 12340 0400" },
      email1: { type: String, default: "enquiry@rnvalves.com" },
      email2: { type: String, default: "enquiry@rnvalves.com" },
      copyrightText: { type: String, default: "© Copyright | RN Valves & Faucets | All Rights Reserved" },
      col1Links: [{ label: { type: String }, href: { type: String } }],
      col2Links: [{ label: { type: String }, href: { type: String } }],
      col3Links: [{ label: { type: String }, href: { type: String } }],
      socials: [{ label: { type: String }, href: { type: String } }],
    },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models && mongoose.models.HomeSetting) {
  delete (mongoose.models as any).HomeSetting;
}

export default mongoose.models.HomeSetting || mongoose.model<IHomeSetting>("HomeSetting", HomeSettingSchema);
