import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Blog from "@/models/Blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalUrl = `https://rnvalves.com/${slug}`;

  let title =
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) + " | RN Valves & Faucets";
  let description =
    "Explore premium Brass & PTMT bath fittings, CP faucets, showers, valves, and bathroom accessories by RN Valves & Faucets.";
  let imageUrl = "/apple-touch-icon.png?v=4";

  try {
    await connectDB();
    const cat = await Category.findOne({
      $or: [{ slug }, { id: slug }],
      status: { $ne: "Inactive" },
    }).lean();

    if (cat) {
      title = `${cat.name || slug} | RN Valves & Faucets`;
      description = cat.description || cat.title || description;
      imageUrl = cat.banner || cat.image || imageUrl;
    } else {
      const blog = await Blog.findOne({
        $or: [{ slug }, { id: slug }],
        status: "Published",
      }).lean();
      if (blog) {
        title = `${(blog as any).metaTitle || (blog as any).title || slug} | RN Valves & Faucets`;
        description =
          (blog as any).metaDescription ||
          (blog as any).excerpt ||
          description;
        imageUrl = (blog as any).coverImage || imageUrl;
      }
    }
  } catch (err) {
    console.error("Failed to generate [slug] metadata:", err);
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [imageUrl],
    },
  };
}

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
