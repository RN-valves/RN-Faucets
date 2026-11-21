import type { Metadata } from "next";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).trim();

    await connectDB();
    const orConditions: any[] = [{ slug: decodedSlug }, { id: decodedSlug }];
    if (mongoose.Types.ObjectId.isValid(decodedSlug)) {
      orConditions.push({ _id: decodedSlug });
    }

    const blog: any = await Blog.findOne({ $or: orConditions }).lean();

    if (!blog) {
      return {
        title: "Blog Article | RN Valves & Faucets",
        description:
          "Explore bathroom design trends, plumbing tips, and bathware guides from RN Valves & Faucets.",
      };
    }

    const title = `${blog.title} | RN Valves & Faucets`;
    const description =
      blog.summary ||
      "Explore bathroom design trends, plumbing tips, and bathware guides from RN Valves & Faucets.";
    const canonicalUrl = `https://rnvalves.com/blogs/${encodeURIComponent(blog.slug || decodedSlug)}`;
    const imageUrl = blog.image
      ? blog.image.startsWith("http")
        ? blog.image
        : `https://rnvalves.com${blog.image.startsWith("/") ? "" : "/"}${blog.image}`
      : "https://rnvalves.com/rn-header-logo.svg";

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
        type: "article",
        images: [{ url: imageUrl, alt: blog.title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Blogs & Bathware Insights | RN Valves & Faucets",
    };
  }
}

export default function BlogDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
