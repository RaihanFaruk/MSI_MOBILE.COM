import { supabase } from "@/lib/supabase";
import { Product, DbProduct } from "@/types";

// Standard column projection for product cards (avoid select('*') and large text blobs)
const PRODUCT_CARD_COLUMNS = "id, name, slug, brand, category_id, price, discount_price, stock, specs, images, rating, reviews_count, is_featured, is_flash_sale, categories(id, name, slug)";

export function mapDbProductToCard(p: DbProduct, badge?: { text: string; type: "discount" | "new" | "hot" }): Product {
  const firstImg = Array.isArray(p.images) && p.images.length > 0
    ? p.images[0]
    : "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80";

  return {
    id: String(p.id),
    name: p.name,
    brand: p.brand,
    category: p.categories?.name || "Tech",
    image: firstImg,
    price: Number(p.price),
    originalPrice: p.discount_price ? Number(p.discount_price) : undefined,
    rating: p.rating ? Number(p.rating) : 4.8,
    reviewsCount: p.reviews_count || 40,
    specs: p.specs || undefined,
    inStock: (p.stock || 0) > 0,
    badge: badge,
    description: p.description,
  };
}

/**
 * Flash Sale Products (Limit 4)
 */
export async function getFlashSaleProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_COLUMNS)
      .not("discount_price", "is", null)
      .order("id", { ascending: true })
      .limit(4);

    if (error || !data) return [];
    return (data as unknown as DbProduct[]).map((p) =>
      mapDbProductToCard(p, { text: "HOT DEAL", type: "hot" })
    );
  } catch (err) {
    console.error("Flash sale fetch error:", err);
    return [];
  }
}

/**
 * Best Deals (Limit 4)
 */
export async function getBestDeals(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_COLUMNS)
      .not("discount_price", "is", null)
      .order("id", { ascending: true })
      .range(4, 7);

    if (error || !data) return [];
    return (data as unknown as DbProduct[]).map((p) =>
      mapDbProductToCard(p, { text: "BEST DEAL", type: "discount" })
    );
  } catch (err) {
    console.error("Best deals fetch error:", err);
    return [];
  }
}

/**
 * New Arrivals (Limit 4, ordered by id DESC)
 */
export async function getNewArrivals(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_COLUMNS)
      .order("id", { ascending: false })
      .limit(4);

    if (error || !data) return [];
    return (data as unknown as DbProduct[]).map((p) =>
      mapDbProductToCard(p, { text: "NEW ARRIVAL", type: "new" })
    );
  } catch (err) {
    console.error("New arrivals fetch error:", err);
    return [];
  }
}

/**
 * Trending Products (Limit 4, highest rating)
 */
export async function getTrendingProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_COLUMNS)
      .order("rating", { ascending: false })
      .limit(4);

    if (error || !data) return [];
    return (data as unknown as DbProduct[]).map((p) =>
      mapDbProductToCard(p, { text: "TRENDING", type: "hot" })
    );
  } catch (err) {
    console.error("Trending fetch error:", err);
    return [];
  }
}

/**
 * Smartphones (Category name / slug 'smartphones' or 'Smartphones')
 */
export async function getSmartphones(brand?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from("products")
      .select(PRODUCT_CARD_COLUMNS)
      .eq("categories.slug", "smartphones")
      .order("rating", { ascending: false })
      .limit(4);

    if (brand && brand !== "all") {
      query = query.ilike("brand", `%${brand}%`);
    }

    const { data, error } = await query;
    if (error || !data) {
      // Fallback query if categories join filter is strict
      const { data: fallback } = await supabase
        .from("products")
        .select(PRODUCT_CARD_COLUMNS)
        .order("id", { ascending: true })
        .limit(4);
      return ((fallback || []) as unknown as DbProduct[]).map((p) => mapDbProductToCard(p));
    }

    const mapped = (data as unknown as DbProduct[]).filter((p) => p.categories !== null);
    return (mapped.length > 0 ? mapped : (data as unknown as DbProduct[])).map((p) =>
      mapDbProductToCard(p)
    );
  } catch (err) {
    console.error("Smartphones fetch error:", err);
    return [];
  }
}

/**
 * Powerful Laptops (Category 'laptops')
 */
export async function getLaptops(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_COLUMNS)
      .eq("categories.slug", "laptops")
      .limit(4);

    if (error || !data || data.length === 0) {
      const { data: fallback } = await supabase
        .from("products")
        .select(PRODUCT_CARD_COLUMNS)
        .ilike("name", "%laptop%")
        .limit(4);
      return ((fallback || []) as unknown as DbProduct[]).map((p) =>
        mapDbProductToCard(p, { text: "LAPTOP", type: "discount" })
      );
    }

    return (data as unknown as DbProduct[]).map((p) =>
      mapDbProductToCard(p, { text: "LAPTOP", type: "discount" })
    );
  } catch (err) {
    console.error("Laptops fetch error:", err);
    return [];
  }
}

/**
 * Gadgets & Accessories
 */
export async function getGadgets(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_CARD_COLUMNS)
      .in("categories.slug", ["smartwatches", "audio", "accessories", "cameras"])
      .limit(4);

    if (error || !data || data.length === 0) {
      const { data: fallback } = await supabase
        .from("products")
        .select(PRODUCT_CARD_COLUMNS)
        .order("id", { ascending: true })
        .range(8, 11);
      return ((fallback || []) as unknown as DbProduct[]).map((p) =>
        mapDbProductToCard(p, { text: "GADGET", type: "new" })
      );
    }

    return (data as unknown as DbProduct[]).map((p) =>
      mapDbProductToCard(p, { text: "GADGET", type: "new" })
    );
  } catch (err) {
    console.error("Gadgets fetch error:", err);
    return [];
  }
}
