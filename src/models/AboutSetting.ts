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
      introAccentText: { type: String, default: "Faucets and Plumbing Systems in india." },
      introDescription: {
        type: String,
        default:
          "We are committed towards constant innovations in plumbing, irrigation and sewerage technologies to meet the nation's constantly increasing water demands. RN Valves constantly strives to pave the way for a future that provides clean water for everyone and everywhere; from the smallest villages to the largest cities.",
      },
      visionText: {
        type: String,
        default:
          "To be an acknowledged leader in Indian plastic Faucets industry by exceeding customers expectations and maximizing bottom line for all our stake holders.",
      },
      missionText: {
        type: String,
        default:
          "Our mission is to bring a revolution in plastic piping industry through innovative solutions which would create a profitable growth and benefit our customers & the society at large.",
      },
      visionImage: { type: String, default: "" },
      missionImage: { type: String, default: "" },
    },
    manufacturingSection: {
      visible: { type: Boolean, default: true },
      statement: {
        type: String,
        default:
          "Consistently increasing pan-India distributor base to ensure customer proximity and readiness to address their needs.",
      },
      counters: [
        {
          value: { type: String },
          label: { type: String },
        },
      ],
      heading: { type: String, default: "State-Of-The-Art. Manufacturing and Operations Excellence." },
      description: {
        type: String,
        default:
          "Our manufacturing framework is built around advanced machinery and computerized injection moulding processes that deliver consistent, high-precision output at scale — so every product meets the same quality standard, every time.",
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
          "Pan India distribution network powered by 1500+ channel partners, strategically located manufacturing units, branch offices, and warehouse hubs ensuring efficient supply and nationwide product availability.",
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
