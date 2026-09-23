import { connectDB } from "@/lib/mongodb";
import HomeSetting from "@/models/HomeSetting";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Blog from "@/models/Blog";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connectDB();

  let initialHomeSetting: any = null;
  let initialCategories: any[] = [];
  let initialProducts: any[] = [];
  let initialBlogs: any[] = [];

  try {
    const settingDoc = await HomeSetting.findOne().lean();
    if (settingDoc) {
      initialHomeSetting = JSON.parse(JSON.stringify(settingDoc));
    }
  } catch (err) {
    console.error("Failed to fetch HomeSetting in SSR:", err);
  }

  try {
    const catDocs = await Category.find({
      status: { $ne: "Inactive" },
      isVisibleWebsite: { $ne: false },
      isVisible: { $ne: false },
    }).lean();
    if (catDocs && catDocs.length > 0) {
      initialCategories = JSON.parse(JSON.stringify(catDocs));
    }
  } catch (err) {
    console.error("Failed to fetch Categories in SSR:", err);
  }

  try {
    const prodDocs = await Product.find({
      status: { $ne: "Inactive" },
      isVisibleWebsite: { $ne: false },
      isVisible: { $ne: false },
    }).limit(60).lean();
    if (prodDocs && prodDocs.length > 0) {
      initialProducts = JSON.parse(JSON.stringify(prodDocs));
    }
  } catch (err) {
    console.error("Failed to fetch Products in SSR:", err);
  }

  try {
    const blogDocs = await Blog.find({ status: "Published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .lean();
    if (blogDocs && blogDocs.length > 0) {
      initialBlogs = JSON.parse(JSON.stringify(blogDocs));
    }
  } catch (err) {
    console.error("Failed to fetch Blogs in SSR:", err);
  }

  return (
    <HomeClient
      initialHomeSetting={initialHomeSetting}
      initialCategories={initialCategories}
      initialProducts={initialProducts}
      initialBlogs={initialBlogs}
    />
  );
}
