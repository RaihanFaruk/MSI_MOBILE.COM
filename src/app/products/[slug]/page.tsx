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

  const firstImg = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

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
      images: [{ url: firstImg, width: 800, height: 800, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [firstImg],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const firstImg = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

  // Google Rich Snippet JSON-LD Product Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: firstImg,
    description: product.description || `Authentic ${product.name} with official warranty in Bangladesh`,
    brand: {
      "@type": "Brand",
      name: product.brand || "MSI",
    },
    offers: {
      "@type": "Offer",
      url: `https://msimobile.com.bd/products/${product.slug}`,
      priceCurrency: "BDT",
      price: Number(product.price),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: (product.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "MSI MOBILE.COM",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating || 5.0).toFixed(1),
      reviewCount: Math.max(1, product.reviews_count || 10),
    },
  };

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
        const pImg = Array.isArray(p.images) && p.images.length > 0
          ? p.images[0]
          : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

        return {
          id: String(p.id),
          name: p.name,
          brand: p.brand,
          category: "Smartphones",
          image: pImg,
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

  const sanitizedProduct = {
    ...product,
    reviews: (product.reviews || []).filter(
      (r: { is_approved?: boolean }) => r.is_approved !== false
    ),
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient
        product={sanitizedProduct}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
