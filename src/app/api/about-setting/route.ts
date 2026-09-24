import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AboutSetting from "@/models/AboutSetting";

const DEFAULT_ABOUT_SETTINGS = {
  hero: {
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80",
  },
  introVisionMission: {
    visible: true,
    introTitle: "Offering One of the Broadest Ranges of",
    introAccentText: "PTMT & Luxury Bath Fittings in India.",
    introDescription:
      "RN Valves & Faucets is a pioneer in premium PTMT taps, chrome-plated brass fittings, sanitaryware, valves, and luxury bathroom accessories. Built on engineering precision, cutting-edge polymer technology, and uncompromising durability, we deliver corrosion-resistant, lead-free, and aesthetically refined bath solutions designed for modern Indian homes, commercial spaces, and infrastructure projects.",
    visionText:
      "To be India's most trusted and innovative bathware brand, celebrated for pioneering PTMT polymer excellence and luxury bath fittings that unite enduring strength, modern design, and sustainable water management.",
    missionText:
      "Our mission is to redefine bathroom aesthetics and functionality through high-performance PTMT polymer engineering, precision CP brass craftsmanship, and zero-defect manufacturing — delivering unmatched value, long-term reliability, and water efficiency for every customer.",
    visionImage: "",
    missionImage: "",
  },
  manufacturingSection: {
    visible: true,
    statement:
      "Our centralized state-of-the-art manufacturing facility in Sahibabad (Ghaziabad) powers our pan-India distributor network with precision-engineered bath solutions.",
    counters: [
      { value: "01", label: "MANUFACTURING PLANT" },
      { value: "05", label: "DEPOTS" },
      { value: "1,500 ++", label: "CHANNEL PARTNERS" },
    ],
    heading: "State-Of-The-Art Manufacturing and Operations Excellence.",
    description:
      "Our advanced manufacturing plant integrates computerized PTMT injection moulding, precision brass CNC machining, and automated chrome-finishing lines. Every batch undergoes rigorous pressure, leak, and endurance testing to guarantee flawless quality, dimensional accuracy, and lifetime corrosion resistance.",
    features: [
      "Advanced computerized injection moulding machines delivering spotless PTMT finish and dimensional accuracy.",
      "In-house precision tooling, valve core engineering, and automated leak-proof pressure testing.",
      "100% virgin engineering polymers and lead-free brass alloys meeting rigorous national quality standards.",
      "Energy-efficient, sustainable operations with dedicated zero-defect quality control protocols.",
    ],
    youtubeEmbed: "https://www.youtube.com/embed/EV7CsqilJzo",
  },
  timelineSection: {
    visible: true,
    heading: "Milestones",
    subtitle: "Offering cutting-edge designs and energy-saving products that are proudly manufactured in India!",
    milestones: [
      {
        id: "2025",
        year: "2025",
        title: "Establishing a Global Footprint",
        text: "Successfully hosted international-level exhibitions across India, establishing a strong global presence and building long-term partnerships with international clients",
      },
      {
        id: "2020",
        year: "2020",
        title: "Acknowledged as India's Most Promising Brand",
        text: "RN recognised as India's Most Promising Brand by Global Real Estate Congress Launched our factory in Sahibabad with the certificate of registration. Over 500+ employees work here. Currently launched new series of faucets",
      },
      {
        id: "2015",
        year: "2015",
        title: "Successfully exhibition of faucets and debut on all social media platforms",
        text: "Every year, we have a successful product display. Hyderabad, Mumbai, Bangalore, and Delhi all hosted exhibitions. We successfully managed to archive authorized dealers all over the country. Successfully made a space for the RN family in the capital along with 200 employees. RN made its debut on all social media platforms Our website was launched",
      },
      {
        id: "2010",
        year: "2010",
        title: "Got our quality management application",
        text: "Our clients' trust has risen to new heights. Various varieties of faucets have been introduced at various price points to satisfy the needs of customers We execute the full application of ISO90000 Quality management system from design research, development, and manufacture, as demand increases and we are trusted by the customers.",
      },
      {
        id: "2005",
        year: "2005",
        title: "Growth of the firm",
        text: "We added new members to our RN family. The products demand contributed to the growth of the customers' love and trust. As a result, faucets with fashionable designs with some new valves were also released.",
      },
      {
        id: "2000",
        year: "2000",
        title: "Launch of the company",
        text: "RN Valves & Faucets came into existence Valves were launched offline.",
      },
    ],
  },
  networkSection: {
    visible: true,
    eyebrow: "Our Network",
    heading: "Strategic Distribution & Factory Network",
    description:
      "Pan India distribution network powered by 1500+ channel partners, our centralized manufacturing facility, branch offices, and warehouse hubs ensuring efficient supply and nationwide product availability.",
    stats: [
      { value: 1500, suffix: "+", label: "Channel Partners" },
      { value: 18, suffix: "+", label: "Distribution Hubs" },
      { value: 1, suffix: "", label: "Manufacturing Facility" },
      { value: 24, suffix: "/7", label: "Supply Support" },
    ],
  },
  awardsSection: {
    visible: true,
    eyebrow: "Achievements",
    title: "Awards & Recognition",
    description:
      "Celebrating our commitment to quality, innovation, customer trust, and manufacturing excellence through nationally recognized achievements and industry honors.",
    awards: [
      {
        id: "creative-campaign",
        title: "Best Creative Campaign",
        organization: "Customer FEST Awards",
        description: "Recognized for excellence in customer engagement, brand communication, and loyalty-driven marketing initiatives.",
        year: "2024",
      },
      {
        id: "manufacturing-excellence",
        title: "Manufacturing Competitiveness Gold",
        organization: "NAMC National Awards",
        description: "Honored for precision manufacturing systems, quality consistency, and operational excellence across production facilities.",
        year: "2022",
      },
      {
        id: "innovation-leadership",
        title: "Innovation Leadership Award",
        organization: "Indian Plumbing Association",
        description: "Celebrated for pioneering product engineering, water-efficient designs, and forward-looking industry solutions.",
        year: "2023",
      },
      {
        id: "channel-partner",
        title: "Trusted Channel Partner Brand",
        organization: "National Trade Excellence Forum",
        description: "Awarded for pan-India distributor growth, service readiness, and enduring trust across the retail network.",
        year: "2021",
      },
    ],
  },
};

export async function GET() {
  try {
    await connectDB();
    let setting = await AboutSetting.findOne();
    if (!setting) {
      setting = DEFAULT_ABOUT_SETTINGS;
    }
    return NextResponse.json(setting);
  } catch (error) {
    console.error("GET /api/about-setting error:", error);
    return NextResponse.json(DEFAULT_ABOUT_SETTINGS);
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

    let setting = await AboutSetting.findOne();
    if (setting) {
      Object.assign(setting, body);
      await setting.save();
    } else {
      setting = await AboutSetting.create(body);
    }

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    console.error("POST /api/about-setting error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
