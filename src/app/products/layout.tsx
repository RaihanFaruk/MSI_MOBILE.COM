import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products — Smartphones, Laptops & Accessories",
  description: "Browse authentic smartphones, gaming laptops, smartwatches, earbuds and tech accessories with official warranty in Bangladesh.",
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
