import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; productId: string }>;
}): Promise<Metadata> {
  const { category, productId } = await params;
  const decodedProductId = decodeURIComponent(productId);
  const canonicalUrl = `https://rnvalves.com/faucets/${category}/${encodeURIComponent(decodedProductId)}`;

  let title = `${decodedProductId.replace(/-/g, " ")} | RN Valves & Faucets`;
  let description =
    "Explore high-durability Brass & PTMT bathroom fittings, faucets, showers, and accessories manufactured by RN Valves & Faucets.";
  let imageUrl = "/apple-touch-icon.png?v=4";

  try {
    await connectDB();
    const product = await Product.findOne({
      $or: [
        { slug: decodedProductId },
        { code: decodedProductId },
        { id: decodedProductId },
      ],
    })
      .select("name code description shortDescription image subcategoryName categoryName")
      .lean();

    if (product) {
      const prodName = (product as any).name || decodedProductId;
      const prodCode = (product as any).code ? ` (${(product as any).code})` : "";
      const subName = (product as any).subcategoryName ? ` - ${(product as any).subcategoryName}` : "";
      title = `${prodName}${prodCode}${subName} | RN Valves & Faucets`;
      description =
        (product as any).description ||
        (product as any).shortDescription ||
        `Buy ${prodName}${prodCode} from RN Valves & Faucets. Premium quality bath fittings engineered for long life.`;
      imageUrl = (product as any).image || imageUrl;
    }
  } catch (err) {
    console.error("Failed to generate product metadata:", err);
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

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
