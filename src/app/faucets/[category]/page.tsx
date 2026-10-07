import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import Product from "@/models/Product";
import CategoryClient from "@/components/catalogue/CategoryClient";

export const revalidate = 300; // ISR: Pre-render and cache for 5 minutes

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  let name = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
  let description = "Explore our premium faucets, bathroom fittings, and sanitaryware collection at RN Valves & Faucets.";
  let imageUrl = "/apple-touch-icon.png?v=4";

  try {
    await connectDB();
    const sub = await Subcategory.findOne({
      $or: [{ slug: category }, { id: category }],
      status: { $ne: "Inactive" },
    }).lean();

    if (sub) {
      name = sub.name || name;
      description = sub.description || description;
      imageUrl = sub.banner || sub.image || imageUrl;
    } else {
      const cat = await Category.findOne({
        $or: [{ slug: category }, { id: category }],
        status: { $ne: "Inactive" },
      }).lean();
      if (cat) {
        name = cat.name || name;
        description = cat.description || description;
        imageUrl = cat.banner || cat.image || imageUrl;
      }
    }
  } catch (err) {
    console.error("Failed to generate category metadata:", err);
  }

  return {
    title: `${name} | RN Valves & Faucets`,
    description,
    openGraph: {
      title: `${name} | RN Valves & Faucets`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  let initialCategoryData: any = null;
  let initialProducts: any[] = [];
  let initialCategories: any[] = [];
  let initialSubcategories: any[] = [];

  try {
    await connectDB();

    // 1. Fetch active subcategory or category
    let activeSub: any = null;
    let activeCat: any = null;

    if (category && category !== "all") {
      activeSub = await Subcategory.findOne({
        $or: [{ slug: category }, { id: category }],
        status: { $ne: "Inactive" },
      }).lean();

      if (activeSub) {
        initialCategoryData = JSON.parse(JSON.stringify(activeSub));
      } else {
        activeCat = await Category.findOne({
          $or: [{ slug: category }, { id: category }],
          status: { $ne: "Inactive" },
        }).lean();
        if (activeCat) {
          initialCategoryData = JSON.parse(JSON.stringify(activeCat));
        }
      }
    }

    // 2. Fetch products for this category / subcategory
    let productQuery: any = {
      status: { $ne: "Inactive" },
      isVisibleWebsite: { $ne: false },
      isVisible: { $ne: false },
    };

    if (category && category !== "all") {
      if (activeSub) {
        const subNameEscaped = (activeSub.name || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const subSlugEscaped = (activeSub.slug || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        productQuery.$or = [
          { subcategory: activeSub.name },
          { subcategory: activeSub.slug },
          { subcategoryName: activeSub.name },
          { subcategoryName: { $regex: `^${subNameEscaped}$`, $options: "i" } },
          { subcategoryName: { $regex: `^${subSlugEscaped.replace(/-/g, " ")}$`, $options: "i" } },
          { subcategoryId: String(activeSub.id || activeSub._id) },
          { subcategorySlug: activeSub.slug },
          { collectionName: { $regex: `^${subNameEscaped}$`, $options: "i" } },
          { series: { $regex: `^${subNameEscaped}$`, $options: "i" } },
        ];
      } else if (activeCat) {
        const catNameEscaped = (activeCat.name || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const catSlugEscaped = (activeCat.slug || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        productQuery.$or = [
          { category: activeCat.name },
          { category: { $regex: `^${catNameEscaped}$`, $options: "i" } },
          { category: { $regex: `^${catSlugEscaped.replace(/-/g, " ")}$`, $options: "i" } },
          { categorySlug: activeCat.slug },
          { categoryId: String(activeCat.id || activeCat._id) },
          { categoryName: activeCat.name },
        ];
      }
    }

    const [prodDocs, catDocs, subDocs] = await Promise.all([
      Product.find(productQuery)
        .select(
          "id code skuCode name image price inSelling size article colorName category categoryId categoryName categorySlug subcategory subcategoryId subcategoryName subcategorySlug collectionName series slug displayOrder createdAt"
        )
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean(),
      Category.find({
        status: { $ne: "Inactive" },
        isVisibleWebsite: { $ne: false },
        isVisible: { $ne: false },
      })
        .select("id name slug image banner status displayOrder productCount")
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
      Subcategory.find({
        status: { $ne: "Inactive" },
        isVisibleWebsite: { $ne: false },
      })
        .select("id name slug categoryId categoryName image banner status displayOrder productCount")
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
    ]);

    if (Array.isArray(prodDocs)) {
      initialProducts = JSON.parse(JSON.stringify(prodDocs));
    }
    if (Array.isArray(catDocs)) {
      initialCategories = JSON.parse(JSON.stringify(catDocs));
    }
    if (Array.isArray(subDocs)) {
      initialSubcategories = JSON.parse(JSON.stringify(subDocs));
    }
  } catch (err) {
    console.error("SSR CategoryPage error:", err);
  }

  return (
    <CategoryClient
      category={category}
      initialCategoryData={initialCategoryData}
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialSubcategories={initialSubcategories}
    />
  );
}
