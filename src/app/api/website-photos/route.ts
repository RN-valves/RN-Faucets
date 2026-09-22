import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/mongodb";
import WebsitePhoto, { IWebsitePhoto } from "@/models/WebsitePhoto";
import { r2Client, R2_BUCKET, uploadToR2 } from "@/lib/r2";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

const DEFAULT_SEEDS: Array<{
  photoId: string;
  title: string;
  description: string;
  category: "auth" | "branding" | "catalogue" | "homepage" | "other";
  location: string;
  r2Key: string;
  localPath?: string;
  recommendedResolution: string;
  publicUrl: string;
  isCustom: boolean;
}> = [
  {
    photoId: "login-banner",
    title: "User Login Banner Photo",
    description: "Main background banner displayed on the customer login split screen.",
    category: "auth",
    location: "/login-user",
    r2Key: "website/auth/login-bg.jpg",
    localPath: "public/uploads/auth/login-bg.jpg",
    recommendedResolution: "1080 x 1350 px (Portrait)",
    publicUrl: "/uploads/auth/login-bg.jpg",
    isCustom: false,
  },
  {
    photoId: "business-reg-banner",
    title: "Business Registration Banner Photo",
    description: "Side banner displayed on the B2B Dealer / Business Registration page.",
    category: "auth",
    location: "/business-user-registration",
    r2Key: "website/auth/business-bg.jpg",
    localPath: "public/uploads/auth/business-bg.jpg",
    recommendedResolution: "1080 x 1350 px (Portrait)",
    publicUrl: "/uploads/auth/business-bg.jpg",
    isCustom: false,
  },
  {
    photoId: "retail-reg-banner",
    title: "Retail Registration Banner Photo",
    description: "Side banner displayed on the Personal / Retail User Registration page.",
    category: "auth",
    location: "/retail-user-registration",
    r2Key: "website/auth/login-bg.jpg",
    localPath: "public/uploads/auth/login-bg.jpg",
    recommendedResolution: "1080 x 1350 px (Portrait)",
    publicUrl: "/uploads/auth/login-bg.jpg",
    isCustom: false,
  },
  {
    photoId: "header-logo-svg",
    title: "Desktop Header Brand Logo (SVG)",
    description: "Sharp vector SVG brand logo displayed in the top desktop navigation bar.",
    category: "branding",
    location: "Global Website Header (Desktop)",
    r2Key: "website/home/header/logo.svg",
    localPath: "public/logo.svg",
    recommendedResolution: "Vector SVG or 500 x 200 px",
    publicUrl: "/api/media/website/home/header/logo.svg",
    isCustom: false,
  },
  {
    photoId: "header-logo-webp",
    title: "Header Brand Logo (WebP Fallback)",
    description: "High-resolution WebP brand logo used across header, footer branding, and invoices.",
    category: "branding",
    location: "Global Website Header & Footer",
    r2Key: "website/home/header/logo.webp",
    recommendedResolution: "500 x 200 px",
    publicUrl: "/api/media/website/home/header/logo.webp",
    isCustom: false,
  },
  {
    photoId: "mobile-header-logo",
    title: "Mobile Sticky Header Logo",
    description: "Compact logo shown on mobile screens in the sticky mobile navigation bar.",
    category: "branding",
    location: "Mobile Header Navbar (< 768px)",
    r2Key: "website/home/header/mobile-logo.webp",
    recommendedResolution: "300 x 120 px",
    publicUrl: "/api/media/website/home/header/mobile-logo.webp",
    isCustom: false,
  },
  {
    photoId: "default-product-placeholder",
    title: "Default Product Placeholder Image",
    description: "Universal fallback image shown whenever a product image is missing or broken.",
    category: "catalogue",
    location: "Catalogue, Categories & Product Details",
    r2Key: "website/catalogue/products/default/image.webp",
    recommendedResolution: "800 x 800 px (Square)",
    publicUrl: "/api/media/website/catalogue/products/default/image.webp",
    isCustom: false,
  },
  {
    photoId: "space-showcase-bathroom",
    title: "Bathroom Space Showcase Banner",
    description: "High-end luxury bathroom space featured banner displayed on the homepage.",
    category: "homepage",
    location: "Homepage Bathroom Space Section",
    r2Key: "website/home/showcase/space-bathroom.webp",
    recommendedResolution: "1920 x 1080 px (Landscape)",
    publicUrl: "/api/media/website/home/showcase/space-bathroom.webp",
    isCustom: false,
  },
  {
    photoId: "about-cp-craft",
    title: "About Us Chrome Plated Craft Banner",
    description: "Featured craft story photo displayed on the About Us page.",
    category: "homepage",
    location: "/about-us",
    r2Key: "website/about/about-cp.jpg",
    localPath: "public/uploads/aboutus/1736163215-about-cpjpg.jpg",
    recommendedResolution: "1200 x 800 px",
    publicUrl: "/uploads/aboutus/1736163215-about-cpjpg.jpg",
    isCustom: false,
  },
  {
    photoId: "about-ptmt-craft",
    title: "About Us PTMT Engineering Craft Banner",
    description: "PTMT polymer engineering showcase photo displayed on the About Us page.",
    category: "homepage",
    location: "/about-us",
    r2Key: "website/about/about-ptmt.jpg",
    localPath: "public/uploads/aboutus/1736163215-about-ptmtjpg.jpg",
    recommendedResolution: "1200 x 800 px",
    publicUrl: "/uploads/aboutus/1736163215-about-ptmtjpg.jpg",
    isCustom: false,
  },
];

// Helper to check if a file exists locally or in Cloudflare R2
async function verifyPhotoHealth(photo: any) {
  let localExists = false;
  let localSize = 0;
  let localMtime = "";

  if (photo.localPath) {
    const fullPath = path.join(process.cwd(), photo.localPath);
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        if (stats.size > 0) {
          localExists = true;
          localSize = stats.size;
          localMtime = stats.mtime.toISOString();
        }
      } catch {
        // ignore
      }
    }
  }

  let r2Exists = false;
  let r2Size = 0;
  let r2Type = "";
  let r2Mtime = "";

  if (photo.r2Key) {
    try {
      const res = await r2Client.send(
        new HeadObjectCommand({
          Bucket: R2_BUCKET,
          Key: photo.r2Key,
        })
      );
      if (res && res.ContentLength && res.ContentLength > 0) {
        r2Exists = true;
        r2Size = res.ContentLength;
        r2Type = res.ContentType || "";
        r2Mtime = res.LastModified?.toISOString() || "";
      }
    } catch {
      // 404 or NoSuchKey in R2
    }
  }

  const exists = localExists || r2Exists;
  const sizeBytes = r2Size || localSize;
  const lastModified = r2Mtime || localMtime;

  return {
    ...photo.toObject ? photo.toObject() : photo,
    exists,
    status: exists ? "healthy" : "missing",
    sizeBytes,
    sizeFormatted: sizeBytes > 0 ? (sizeBytes > 1024 * 1024 ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB` : `${(sizeBytes / 1024).toFixed(1)} KB`) : "0 KB",
    contentType: r2Type || (photo.publicUrl.endsWith(".svg") ? "image/svg+xml" : "image/jpeg"),
    lastModified,
    localExists,
    r2Exists,
  };
}

export async function GET() {
  try {
    await connectDB();

    // Check if seeds are in DB
    const existing = await WebsitePhoto.find().sort({ createdAt: 1 });
    if (existing.length === 0) {
      await WebsitePhoto.insertMany(DEFAULT_SEEDS);
    } else {
      // Ensure any newly added default seeds exist
      for (const seed of DEFAULT_SEEDS) {
        const has = existing.find((p) => p.photoId === seed.photoId);
        if (!has) {
          await WebsitePhoto.create(seed);
        }
      }
    }

    const allPhotos = await WebsitePhoto.find().sort({ createdAt: 1 });

    // Verify health of all photos concurrently
    const healthResults = await Promise.all(allPhotos.map((p) => verifyPhotoHealth(p)));

    const total = healthResults.length;
    const healthyCount = healthResults.filter((p) => p.exists).length;
    const missingCount = healthResults.filter((p) => !p.exists).length;

    return NextResponse.json({
      success: true,
      photos: healthResults,
      summary: {
        total,
        healthyCount,
        missingCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/website-photos error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load website photos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const photoId = formData.get("photoId") as string;
    const file = formData.get("file") as File | null;

    if (!photoId || !file) {
      return NextResponse.json(
        { success: false, error: "Photo ID and file are required" },
        { status: 400 }
      );
    }

    const photo = await WebsitePhoto.findOne({ photoId });
    if (!photo) {
      return NextResponse.json(
        { success: false, error: `Website photo with ID "${photoId}" not found` },
        { status: 404 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type accurately
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let contentType = file.type;
    if (ext === "svg" || file.type?.includes("svg")) {
      contentType = "image/svg+xml";
    } else if (ext === "webp") {
      contentType = "image/webp";
    } else if (ext === "png") {
      contentType = "image/png";
    } else if (ext === "jpg" || ext === "jpeg") {
      contentType = "image/jpeg";
    }

    // 1. Upload to Cloudflare R2
    const r2Result = await uploadToR2(photo.r2Key, buffer, contentType);

    // 2. If photo has a local path in public/, also update the local file on disk
    if (photo.localPath) {
      const fullPath = path.join(process.cwd(), photo.localPath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, buffer);
    }

    // 3. Update publicUrl cache-buster if needed
    const updatedUrl = photo.localPath
      ? `/${photo.localPath.replace(/^public\//, "")}?v=${Date.now()}`
      : r2Result.publicUrl;

    photo.publicUrl = updatedUrl;
    photo.updatedAt = new Date();
    await photo.save();

    const verified = await verifyPhotoHealth(photo);

    return NextResponse.json({
      success: true,
      message: `"${photo.title}" updated successfully!`,
      photo: verified,
    });
  } catch (error: any) {
    console.error("POST /api/website-photos error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload website photo" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { photoId, title, description, category, location, r2Key, recommendedResolution } = body;

    if (!photoId || !title || !location || !r2Key) {
      return NextResponse.json(
        { success: false, error: "photoId, title, location, and r2Key are required" },
        { status: 400 }
      );
    }

    const publicUrl = `/api/media/${r2Key}?v=${Date.now()}`;

    const updated = await WebsitePhoto.findOneAndUpdate(
      { photoId },
      {
        photoId,
        title,
        description: description || "",
        category: category || "other",
        location,
        r2Key,
        recommendedResolution: recommendedResolution || "",
        publicUrl,
        isCustom: true,
      },
      { upsert: true, new: true }
    );

    const verified = await verifyPhotoHealth(updated);

    return NextResponse.json({
      success: true,
      message: "Custom website photo added/updated successfully",
      photo: verified,
    });
  } catch (error: any) {
    console.error("PUT /api/website-photos error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save photo" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("photoId");

    if (!photoId) {
      return NextResponse.json(
        { success: false, error: "photoId query parameter is required" },
        { status: 400 }
      );
    }

    const photo = await WebsitePhoto.findOne({ photoId });
    if (!photo) {
      return NextResponse.json(
        { success: false, error: "Photo not found" },
        { status: 404 }
      );
    }

    if (!photo.isCustom) {
      return NextResponse.json(
        { success: false, error: "System default website photos cannot be deleted" },
        { status: 400 }
      );
    }

    await WebsitePhoto.deleteOne({ photoId });

    return NextResponse.json({
      success: true,
      message: "Photo tracker removed successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/website-photos error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete photo" },
      { status: 500 }
    );
  }
}
