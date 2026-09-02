import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductDetailsClient from "./ProductDetailsClient";
import { DbProduct, Product } from "@/types";

interface Props {
  params: { slug: string };
}

// Helper to fetch product data on server for SEO & hydration
async function getProductBySlug(slug: string) {
  try {
    // 1. Try exact slug match
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name, slug), product_variations(*), reviews(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (data && !error) {
      return data as DbProduct;
    }

    // 2. If slug is an integer ID, try querying by ID
    const numId = parseInt(slug, 10);
    if (!isNaN(numId) && String(numId) === slug) {
      const { data: idData, error: idErr } = await supabase
        .from("products")
        .select("*, categories(name, slug), product_variations(*), reviews(*)")
        .eq("id", numId)
        .maybeSingle();

      if (idData && !idErr) {
        return idData as DbProduct;
      }
    }

    // 3. Try partial name match
    const cleanSearch = slug.replace(/-/g, " ").trim();
    const { data: nameData } = await supabase
      .from("products")
      .select("*, categories(name, slug), product_variations(*), reviews(*)")
      .ilike("name", `%${cleanSearch}%`)
      .limit(1)
      .maybeSingle();

    if (nameData) {
      return nameData as DbProduct;
    }
  } catch (e) {
    console.log("Supabase fetch error for slug:", slug, e);
  }

  return null;
}

// Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | MSI MOBILE.COM",
      description: "The requested electronics item could not be found.",
    };
  }

  const title = `${product.name} — Best Price in Bangladesh | MSI MOBILE.COM`;
  const description =
    product.description?.slice(0, 160) ||
    `Buy ${product.name} at best price in Bangladesh with official warranty and nationwide delivery from MSI MOBILE.COM.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Fetch related products (same category or general products)
  let relatedProducts: Product[] = [];
  try {
    const { data: relDb } = await supabase
      .from("products")
      .select("*")
      .neq("id", product.id)
      .limit(4);

    if (relDb && relDb.length > 0) {
      relatedProducts = relDb.map((p) => {
        const firstImg = Array.isArray(p.images) && p.images.length > 0
          ? p.images[0]
          : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

        return {
          id: String(p.id),
          name: p.name,
          brand: p.brand,
          category: "Smartphones",
          image: firstImg,
          price: Number(p.price),
          originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
          rating: p.rating ? Number(p.rating) : 4.8,
          reviewsCount: p.reviews_count || 10,
          specs: p.specs,
          inStock: (p.stock || 0) > 0,
        };
      });
    }
  } catch (e) {
    console.log("Related products fallback:", e);
  }

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
