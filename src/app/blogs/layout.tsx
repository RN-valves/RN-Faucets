import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & Bathware Insights | RN Valves & Faucets",
  description:
    "Read the latest articles, plumbing guides, bathroom design trends, and bathware maintenance tips from RN Valves & Faucets.",
  alternates: {
    canonical: "https://rnvalves.com/blogs",
  },
  openGraph: {
    title: "Blogs & Bathware Insights | RN Valves & Faucets",
    description:
      "Read the latest articles, plumbing guides, bathroom design trends, and bathware maintenance tips from RN Valves & Faucets.",
    url: "https://rnvalves.com/blogs",
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
