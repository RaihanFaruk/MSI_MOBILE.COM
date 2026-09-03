-- Migration: High-Performance Database Indexes for Storefront & Homepage
-- Date: 2026-09-04
-- Target: Optimizes Homepage & Catalog query latency (TTFB < 50ms)

-- 1. Index on products category foreign key
CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON public.products (category_id);

-- 2. Partial index on discounted products (Flash Sale & Best Deals)
CREATE INDEX IF NOT EXISTS idx_products_discount_price 
ON public.products (discount_price) 
WHERE discount_price IS NOT NULL;

-- 3. Index for trending & top-rated items
CREATE INDEX IF NOT EXISTS idx_products_rating_desc 
ON public.products (rating DESC NULLS LAST);

-- 4. Index for brand filtering (Smartphones by brand)
CREATE INDEX IF NOT EXISTS idx_products_brand 
ON public.products (brand);

-- 5. Index on categories slug for fast relational lookup
CREATE INDEX IF NOT EXISTS idx_categories_slug 
ON public.categories (slug);

-- 6. Index on product stock for fast availability filtering
CREATE INDEX IF NOT EXISTS idx_products_stock 
ON public.products (stock);

-- 7. Composite index on products (category_id, rating DESC)
CREATE INDEX IF NOT EXISTS idx_products_category_rating 
ON public.products (category_id, rating DESC);
