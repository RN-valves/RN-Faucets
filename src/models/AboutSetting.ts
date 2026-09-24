import mongoose, { Schema, Document } from "mongoose";

export interface IAboutSetting extends Document {
  hero: {
    image: string;
  };
  introVisionMission: {
    visible: boolean;
    introTitle: string;
    introAccentText: string;
    introDescription: string;
    visionText: string;
    missionText: string;
    visionImage?: string;
    missionImage?: string;
  };
  manufacturingSection: {
    visible: boolean;
    statement: string;
    counters: Array<{ value: string; label: string }>;
    heading: string;
    description: string;
    features: string[];
    youtubeEmbed: string;
  };
  timelineSection: {
    visible: boolean;
    heading: string;
    subtitle: string;
    milestones: Array<{
      id: string;
      year: string;
      title: string;
      text: string;
      image?: string;
    }>;
  };
  networkSection: {
    visible: boolean;
    eyebrow: string;
    heading: string;
    description: string;
    stats: Array<{ value: number; suffix: string; label: string }>;
  };
  awardsSection: {
    visible: boolean;
    eyebrow: string;
    title: string;
    description: string;
    awards: Array<{
      id: string;
      title: string;
      organization: string;
      description: string;
      year: string;
      image?: string;
    }>;
  };
  updatedAt: Date;
}

const AboutSettingSchema = new Schema<IAboutSetting>(
  {
    hero: {
      image: {
        type: String,
        default: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80",
      },
    },
    introVisionMission: {
      visible: { type: Boolean, default: true },
      introTitle: { type: String, default: "Offering One of the Broadest Ranges of" },
      introAccentText: { type: String, default: "PTMT & Luxury Bath Fittings in India." },
      introDescription: {
        type: String,
        default:
          "RN Valves & Faucets is a pioneer in premium PTMT taps, chrome-plated brass fittings, sanitaryware, valves, and luxury bathroom accessories. Built on engineering precision, cutting-edge polymer technology, and uncompromising durability, we deliver corrosion-resistant, lead-free, and aesthetically refined bath solutions designed for modern Indian homes, commercial spaces, and infrastructure projects.",
      },
      visionText: {
        type: String,
        default:
          "To be India's most trusted and innovative bathware brand, celebrated for pioneering PTMT polymer excellence and luxury bath fittings that unite enduring strength, modern design, and sustainable water management.",
      },
      missionText: {
        type: String,
        default:
          "Our mission is to redefine bathroom aesthetics and functionality through high-performance PTMT polymer engineering, precision CP brass craftsmanship, and zero-defect manufacturing — delivering unmatched value, long-term reliability, and water efficiency for every customer.",
      },
      visionImage: { type: String, default: "" },
      missionImage: { type: String, default: "" },
    },
    manufacturingSection: {
      visible: { type: Boolean, default: true },
      statement: {
        type: String,
        default:
          "Our centralized state-of-the-art manufacturing facility in Sahibabad (Ghaziabad) powers our pan-India distributor network with precision-engineered bath solutions.",
      },
      counters: [
        {
          value: { type: String },
          label: { type: String },
        },
      ],
      heading: { type: String, default: "State-Of-The-Art Manufacturing and Operations Excellence." },
      description: {
        type: String,
        default:
          "Our advanced manufacturing plant integrates computerized PTMT injection moulding, precision brass CNC machining, and automated chrome-finishing lines. Every batch undergoes rigorous pressure, leak, and endurance testing to guarantee flawless quality, dimensional accuracy, and lifetime corrosion resistance.",
      },
      features: [{ type: String }],
      youtubeEmbed: { type: String, default: "https://www.youtube.com/embed/EV7CsqilJzo" },
    },
    timelineSection: {
      visible: { type: Boolean, default: true },
      heading: { type: String, default: "Milestones" },
      subtitle: {
        type: String,
        default: "Offering cutting-edge designs and energy-saving products that are proudly manufactured in India!",
      },
      milestones: [
        {
          id: { type: String },
          year: { type: String },
          title: { type: String },
          text: { type: String },
          image: { type: String },
        },
      ],
    },
    networkSection: {
      visible: { type: Boolean, default: true },
      eyebrow: { type: String, default: "Our Network" },
      heading: { type: String, default: "Strategic Distribution & Factory Network" },
      description: {
        type: String,
        default:
          "Pan India distribution network powered by 1500+ channel partners, our centralized manufacturing facility, branch offices, and warehouse hubs ensuring efficient supply and nationwide product availability.",
      },
      stats: [
        {
          value: { type: Number },
          suffix: { type: String },
          label: { type: String },
        },
      ],
    },
    awardsSection: {
      visible: { type: Boolean, default: true },
      eyebrow: { type: String, default: "Achievements" },
      title: { type: String, default: "Awards & Recognition" },
      description: {
        type: String,
        default:
          "Celebrating our commitment to quality, innovation, customer trust, and manufacturing excellence through nationally recognized achievements and industry honors.",
      },
      awards: [
        {
          id: { type: String },
          title: { type: String },
          organization: { type: String },
          description: { type: String },
          year: { type: String },
          image: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.models.AboutSetting || mongoose.model<IAboutSetting>("AboutSetting", AboutSettingSchema);
