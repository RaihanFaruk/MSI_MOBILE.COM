-- =========================================================================
-- Supabase PostgreSQL Migration: MSI MOBILE Complete Seed, Schema & Atomic RPC
-- Target Supabase Project: hlvndzpauxrqczeiwger
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  item_count INTEGER DEFAULT 0,
  parent_id UUID,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ensure Products Table & Missing Columns
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(12, 2) CHECK (discount_price IS NULL OR discount_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  specs TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 3. Ensure Product Variations Table & Missing Columns
CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color TEXT,
  storage TEXT,
  sku TEXT UNIQUE,
  price NUMERIC(12, 2),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

ALTER TABLE public.product_variations ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.product_variations ADD COLUMN IF NOT EXISTS storage TEXT;
ALTER TABLE public.product_variations ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.product_variations ADD COLUMN IF NOT EXISTS price NUMERIC(12, 2);
ALTER TABLE public.product_variations ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- 4. Ensure Orders Table & Add All Missing Columns
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  order_number TEXT UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  items JSONB,
  subtotal NUMERIC(12, 2),
  shipping_fee NUMERIC(12, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2),
  status TEXT DEFAULT 'confirmed',
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'unpaid',
  coupon_code TEXT,
  tracking_updates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_updates JSONB DEFAULT '[]'::jsonb;

-- 5. Ensure Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2),
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Ensure Reviews Table & Missing Columns
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing public policies to avoid duplicate name conflict
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Product Variations" ON public.product_variations;
DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public Read Active Coupons" ON public.coupons;
DROP POLICY IF EXISTS "Users Read Own Orders" ON public.orders;

-- Public READ-ONLY (SELECT) Policies for anon/authenticated clients
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Product Variations" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Active Coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Users Read Own Orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- =========================================================================
-- ATOMIC ORDER CREATION RPC (Anti-Tampering Price Verification & Row Locking)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address JSONB,
  p_items JSONB,
  p_payment_method TEXT DEFAULT 'COD',
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_variation_id UUID;
  v_quantity INTEGER;
  v_product_row public.products%ROWTYPE;
  v_variation_row public.product_variations%ROWTYPE;
  v_item_color TEXT;
  v_item_storage TEXT;
  v_line_unit_price NUMERIC(12, 2);
  v_line_total NUMERIC(12, 2);
  v_subtotal NUMERIC(12, 2) := 0;
  v_discount NUMERIC(12, 2) := 0;
  v_shipping NUMERIC(12, 2) := 0;
  v_grand_total NUMERIC(12, 2) := 0;
  v_verified_items JSONB := '[]'::jsonb;
  v_order_id UUID;
  v_order_number TEXT;
  v_coupon_record RECORD;
BEGIN
  -- Generate unique order number
  v_order_number := 'MSI-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

  -- Process and lock each line item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_variation_id := NULLIF(NULLIF(v_item->>'variation_id', 'null'), 'std')::UUID;
    v_quantity := GREATEST(1, COALESCE((v_item->>'quantity')::INTEGER, 1));
    v_item_color := NULL;
    v_item_storage := NULL;

    -- Acquire exclusive row lock on product
    SELECT * INTO v_product_row
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % does not exist in catalog.', v_product_id;
    END IF;

    -- If variation specified, lock variation row and check live stock
    IF v_variation_id IS NOT NULL THEN
      SELECT * INTO v_variation_row
      FROM public.product_variations
      WHERE id = v_variation_id AND product_id = v_product_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Variation % for product "%" not found.', v_variation_id, v_product_row.name;
      END IF;

      -- Concurrency check: reject if stock is insufficient
      IF v_variation_row.stock < v_quantity THEN
        RAISE EXCEPTION 'ERR_INSUFFICIENT_STOCK: Item "% - % %" only has % units remaining.',
          v_product_row.name, COALESCE(v_variation_row.color, ''), COALESCE(v_variation_row.storage, ''), v_variation_row.stock;
      END IF;

      v_item_color := v_variation_row.color;
      v_item_storage := v_variation_row.storage;
      v_line_unit_price := COALESCE(v_variation_row.price, v_product_row.price);

      -- Decrement variation stock atomically
      UPDATE public.product_variations
      SET stock = stock - v_quantity
      WHERE id = v_variation_id;
    ELSE
      -- Check parent product stock live
      IF v_product_row.stock < v_quantity THEN
        RAISE EXCEPTION 'ERR_INSUFFICIENT_STOCK: Product "%" only has % units available.', v_product_row.name, v_product_row.stock;
      END IF;

      v_line_unit_price := v_product_row.price;
    END IF;

    -- Decrement base product stock
    UPDATE public.products
    SET stock = GREATEST(0, stock - v_quantity)
    WHERE id = v_product_id;

    v_line_total := v_line_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    -- Append to server-verified items array safely
    v_verified_items := v_verified_items || jsonb_build_object(
      'product_id', v_product_id,
      'variation_id', v_variation_id,
      'product_name', v_product_row.name,
      'color', v_item_color,
      'storage', v_item_storage,
      'unit_price', v_line_unit_price,
      'quantity', v_quantity,
      'line_total', v_line_total
    );
  END LOOP;

  -- Verify and apply coupon if provided
  IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
    SELECT * INTO v_coupon_record
    FROM public.coupons
    WHERE code = UPPER(TRIM(p_coupon_code))
      AND is_active = true
      AND (valid_until IS NULL OR valid_until > NOW())
      AND (usage_limit IS NULL OR used_count < usage_limit)
    FOR UPDATE;

    IF FOUND THEN
      IF v_subtotal >= COALESCE(v_coupon_record.min_order_amount, 0) THEN
        IF v_coupon_record.discount_type = 'percentage' THEN
          v_discount := (v_subtotal * v_coupon_record.discount_value / 100.0);
          IF v_coupon_record.max_discount_amount IS NOT NULL THEN
            v_discount := LEAST(v_discount, v_coupon_record.max_discount_amount);
          END IF;
        ELSE
          v_discount := LEAST(v_coupon_record.discount_value, v_subtotal);
        END IF;

        UPDATE public.coupons
        SET used_count = used_count + 1
        WHERE id = v_coupon_record.id;
      END IF;
    END IF;
  END IF;

  v_grand_total := GREATEST(0, v_subtotal - v_discount + v_shipping);

  -- Insert authoritative order ledger record
  INSERT INTO public.orders (
    user_id,
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    items,
    subtotal,
    shipping_fee,
    discount_amount,
    total_amount,
    status,
    payment_method,
    payment_status,
    coupon_code,
    tracking_updates
  ) VALUES (
    p_user_id,
    v_order_number,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_shipping_address,
    v_verified_items,
    v_subtotal,
    v_shipping,
    v_discount,
    v_grand_total,
    'confirmed',
    p_payment_method,
    CASE WHEN p_payment_method = 'COD' THEN 'unpaid' ELSE 'paid' END,
    p_coupon_code,
    jsonb_build_array(
      jsonb_build_object(
        'status', 'confirmed',
        'title', 'Order Placed & Verified',
        'message', 'Your order was successfully verified with live stock allocation.',
        'timestamp', TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
    )
  )
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'shipping', v_shipping,
    'total', v_grand_total,
    'status', 'confirmed'
  );
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.create_order_atomic TO anon, authenticated, service_role;

-- =========================================================================
-- SEED DATA: 10 CATEGORIES
-- =========================================================================
INSERT INTO public.categories (name, slug, icon, description)
VALUES
  ('Smartphones', 'smartphones', 'Smartphone', 'Official flagship & mid-range smartphones'),
  ('Laptops', 'laptops', 'Laptop', 'Gaming laptops & creator workstations'),
  ('Tablets', 'tablets', 'Tablet', 'iPads & Android media tablets'),
  ('Smart Watches', 'smart-watches', 'Watch', 'Fitness trackers & premium smartwatches'),
  ('Earbuds', 'earbuds', 'Headphones', 'True wireless stereo earbuds & ANC pods'),
  ('Headphones', 'headphones', 'Headset', 'Over-ear studio & noise cancelling headphones'),
  ('Speakers', 'speakers', 'Volume2', 'Portable bluetooth & home audio speakers'),
  ('Chargers & Power Banks', 'chargers', 'Zap', 'GaN fast chargers, power banks & cables'),
  ('Gaming', 'gaming', 'Gamepad2', 'Gaming gear, consoles & accessories'),
  ('Cameras', 'cameras', 'Camera', 'Action cameras, vlogging gear & gimbals')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description;

-- =========================================================================
-- SEED DATA: 14 FLAGSHIP PRODUCTS (Using deterministic UUIDs)
-- =========================================================================
INSERT INTO public.products (id, name, slug, brand, category_id, price, discount_price, stock, specs, description, images, rating, reviews_count, is_featured)
VALUES
  -- 1. Samsung Galaxy S24 Ultra
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'Samsung Galaxy S24 Ultra 5G', 'samsung-galaxy-s24-ultra-5g', 'SAMSUNG',
   (SELECT id FROM public.categories WHERE slug = 'smartphones' LIMIT 1),
   139999, 155000, 45,
   '12GB RAM • 256GB • Snapdragon 8 Gen 3 • 200MP Quad Camera • 5000mAh',
   'The ultimate Galaxy AI powerhouse with built-in S Pen, titanium armor frame, and pro-grade 200MP camera system.',
   ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
   4.9, 128, true),

  -- 2. iPhone 16 Pro Max
  ('a0000000-0000-0000-0000-000000000002'::uuid, 'Apple iPhone 16 Pro Max', 'apple-iphone-16-pro-max', 'APPLE',
   (SELECT id FROM public.categories WHERE slug = 'smartphones' LIMIT 1),
   179999, 195000, 30,
   '8GB RAM • 256GB • A18 Pro Bionic • 48MP Fusion Camera • Grade 5 Titanium',
   'Designed for Apple Intelligence with the groundbreaking A18 Pro chip, 4K 120 fps Dolby Vision, and camera control.',
   ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
   5.0, 210, true),

  -- 3. Xiaomi 14 Ultra
  ('a0000000-0000-0000-0000-000000000003'::uuid, 'Xiaomi 14 Ultra 5G Leica', 'xiaomi-14-ultra-5g-leica', 'XIAOMI',
   (SELECT id FROM public.categories WHERE slug = 'smartphones' LIMIT 1),
   114999, 128000, 25,
   '16GB RAM • 512GB • Leica 1-inch Quad Optics • Snapdragon 8 Gen 3',
   'Legendary optical craftsmanship featuring Leica quad camera system with 1-inch variable aperture main sensor.',
   ARRAY['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'],
   4.8, 74, true),

  -- 4. OnePlus 12
  ('a0000000-0000-0000-0000-000000000004'::uuid, 'OnePlus 12 5G Hasselblad', 'oneplus-12-5g-hasselblad', 'ONEPLUS',
   (SELECT id FROM public.categories WHERE slug = 'smartphones' LIMIT 1),
   84999, 95000, 40,
   '16GB RAM • 512GB • 4th Gen Hasselblad Camera • 100W SUPERVOOC • 5400mAh',
   'Smooth Beyond Belief with flagship Snapdragon 8 Gen 3, 2K 120Hz ProXDR display, and 100W wired ultra-fast charging.',
   ARRAY['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80'],
   4.9, 92, true),

  -- 5. Google Pixel 9 Pro
  ('a0000000-0000-0000-0000-000000000005'::uuid, 'Google Pixel 9 Pro XL', 'google-pixel-9-pro-xl', 'GOOGLE',
   (SELECT id FROM public.categories WHERE slug = 'smartphones' LIMIT 1),
   124999, 135000, 20,
   '16GB RAM • 256GB • Google Tensor G4 • Super Actua Display • Gemini Nano',
   'Engineered by Google with next-gen Gemini AI, triple pro camera system with 30x Super Res Zoom, and 7 years of OS updates.',
   ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
   4.8, 64, false),

  -- 6. MSI Titan 18 HX
  ('a0000000-0000-0000-0000-000000000006'::uuid, 'MSI Titan 18 HX Dragon Monster', 'msi-titan-18-hx-dragon-monster', 'MSI',
   (SELECT id FROM public.categories WHERE slug = 'laptops' LIMIT 1),
   449999, 485000, 10,
   'Core i9-14900HX • RTX 4090 16GB • 64GB DDR5 • 4TB NVMe SSD • 18" 4K 120Hz Mini-LED',
   'The absolute pinnacle of gaming performance with dual vapor chamber cooling, mechanical Cherry MX keyboard, and RTX 4090.',
   ARRAY['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'],
   5.0, 38, true),

  -- 7. MSI Raider GE78 HX
  ('a0000000-0000-0000-0000-000000000007'::uuid, 'MSI Raider GE78 HX Gaming Beast', 'msi-raider-ge78-hx-gaming-beast', 'MSI',
   (SELECT id FROM public.categories WHERE slug = 'laptops' LIMIT 1),
   319999, 345000, 15,
   'Core i9-14900HX • RTX 4080 12GB • 32GB DDR5 • 2TB NVMe SSD • 17" QHD+ 240Hz',
   'Cyberpunk-inspired matrix RGB light bar, immersive Dynaudio 6-speaker sound system, and extreme overclocking headroom.',
   ARRAY['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'],
   4.9, 52, true),

  -- 8. ASUS ROG Strix SCAR 16
  ('a0000000-0000-0000-0000-000000000008'::uuid, 'ASUS ROG Strix SCAR 16 (2026)', 'asus-rog-strix-scar-16-2026', 'ASUS',
   (SELECT id FROM public.categories WHERE slug = 'laptops' LIMIT 1),
   289999, 310000, 12,
   'Core i9-14900HX • RTX 4080 12GB • 32GB DDR5 • 1TB PCIe 4.0 • 16" ROG Nebula HDR',
   'Dominating esports gaming machine with Conductonaut Extreme liquid metal and Tri-Fan thermal technology.',
   ARRAY['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'],
   4.9, 45, true),

  -- 9. MacBook Pro 16 M3 Max
  ('a0000000-0000-0000-0000-000000000009'::uuid, 'Apple MacBook Pro 16 M3 Max', 'apple-macbook-pro-16-m3-max', 'APPLE',
   (SELECT id FROM public.categories WHERE slug = 'laptops' LIMIT 1),
   389999, 415000, 18,
   'M3 Max 16-Core CPU • 40-Core GPU • 48GB Unified RAM • 1TB SSD • Liquid Retina XDR',
   'Mind-blowing capability for 3D animation, complex machine learning training, and multi-stream 8K ProRes editing.',
   ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'],
   5.0, 96, true),

  -- 10. Sony WH-1000XM5
  ('a0000000-0000-0000-0000-000000000010'::uuid, 'Sony WH-1000XM5 Wireless ANC Headphones', 'sony-wh-1000xm5-wireless-anc-headphones', 'SONY',
   (SELECT id FROM public.categories WHERE slug = 'headphones' LIMIT 1),
   34999, 39999, 50,
   'Auto NC Optimizer • 8 Mics • 30hr Battery • LDAC Hi-Res Audio • Multipoint',
   'Industry-leading active noise cancellation with 2 processors, 8 microphones, and ultra-comfortable lightweight design.',
   ARRAY['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80'],
   4.9, 140, true),

  -- 11. Apple AirPods Pro 2
  ('a0000000-0000-0000-0000-000000000011'::uuid, 'Apple AirPods Pro (2nd Gen) USB-C', 'apple-airpods-pro-2nd-gen-usb-c', 'APPLE',
   (SELECT id FROM public.categories WHERE slug = 'earbuds' LIMIT 1),
   27999, 32000, 60,
   'H2 Chip • 2x Active Noise Cancellation • Adaptive Audio • MagSafe Case (USB-C)',
   'Up to 2x more active noise cancellation, transparency mode with conversation awareness, and personalized spatial audio.',
   ARRAY['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80'],
   4.9, 230, true),

  -- 12. JBL Boombox 3
  ('a0000000-0000-0000-0000-000000000012'::uuid, 'JBL Boombox 3 Wi-Fi & Bluetooth Speaker', 'jbl-boombox-3-wifi-bluetooth-speaker', 'JBL',
   (SELECT id FROM public.categories WHERE slug = 'speakers' LIMIT 1),
   52999, 58000, 25,
   '180W RMS • Massive Bass • 24hr Playtime • IP67 Waterproof • Dolby Atmos',
   'Massive sound with monstrous bass. Stream hi-res 3D Dolby Atmos audio over Wi-Fi while keeping your phone free.',
   ARRAY['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80'],
   4.8, 68, false),

  -- 13. Anker Prime 27,650mAh Power Bank
  ('a0000000-0000-0000-0000-000000000013'::uuid, 'Anker Prime 27,650mAh Power Bank (250W)', 'anker-prime-27650mah-power-bank-250w', 'ANKER',
   (SELECT id FROM public.categories WHERE slug = 'chargers' LIMIT 1),
   15999, 18500, 80,
   '250W Total Output • 140W Single Port • Smart Digital Display • TSA Airline Approved',
   'Charge two laptops simultaneously at high speed with ultra-fast 170W recharge capability and smart app controls.',
   ARRAY['https://images.unsplash.com/photo-1609592426815-58e6e5898d28?w=600&auto=format&fit=crop&q=80'],
   4.9, 115, true),

  -- 14. DJI Osmo Pocket 3
  ('a0000000-0000-0000-0000-000000000014'::uuid, 'DJI Osmo Pocket 3 Creator Combo', 'dji-osmo-pocket-3-creator-combo', 'DJI',
   (SELECT id FROM public.categories WHERE slug = 'cameras' LIMIT 1),
   78999, 85000, 20,
   '1-inch CMOS Sensor • 4K/120fps • 2-inch Rotatable OLED Touchscreen • 3-Axis Gimbal',
   'Capture stunning detail in motion with powerful 1-inch sensor, D-Log M color profile, and ActiveTrack 6.0 subject tracking.',
   ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80'],
   5.0, 58, true)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  stock = EXCLUDED.stock,
  specs = EXCLUDED.specs,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_featured = EXCLUDED.is_featured;

-- =========================================================================
-- SEED DATA: PRODUCT VARIATIONS (Using deterministic UUIDs)
-- =========================================================================
INSERT INTO public.product_variations (id, product_id, color, storage, sku, price, stock)
VALUES
  -- S24 Ultra Variations (Product ID: a0000000-0000-0000-0000-000000000001)
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Titanium Black', '256GB', 'S24U-256-BLK', 139999, 20),
  ('b0000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Titanium Gray', '512GB', 'S24U-512-GRY', 154999, 15),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Titanium Violet', '1TB', 'S24U-1TB-VIO', 179999, 10),

  -- iPhone 16 Pro Max Variations (Product ID: a0000000-0000-0000-0000-000000000002)
  ('b0000000-0000-0000-0000-000000000004'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, 'Natural Titanium', '256GB', 'IP16PM-256-NAT', 179999, 15),
  ('b0000000-0000-0000-0000-000000000005'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, 'Black Titanium', '512GB', 'IP16PM-512-BLK', 199999, 10),
  ('b0000000-0000-0000-0000-000000000006'::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, 'Desert Titanium', '1TB', 'IP16PM-1TB-DES', 229999, 8),

  -- Xiaomi 14 Ultra Variations (Product ID: a0000000-0000-0000-0000-000000000003)
  ('b0000000-0000-0000-0000-000000000007'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid, 'Black Vegan Leather', '512GB', 'MI14U-512-BLK', 114999, 15),
  ('b0000000-0000-0000-0000-000000000008'::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid, 'White Ceramic', '512GB', 'MI14U-512-WHT', 114999, 10),

  -- OnePlus 12 Variations (Product ID: a0000000-0000-0000-0000-000000000004)
  ('b0000000-0000-0000-0000-000000000009'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid, 'Flowy Emerald', '512GB', 'OP12-512-GRN', 84999, 25),
  ('b0000000-0000-0000-0000-000000000010'::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid, 'Silky Black', '256GB', 'OP12-256-BLK', 74999, 15)
ON CONFLICT (id) DO UPDATE
SET
  color = EXCLUDED.color,
  storage = EXCLUDED.storage,
  sku = EXCLUDED.sku,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock;

-- =========================================================================
-- SEED DATA: COUPONS
-- =========================================================================
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'MSIFIRST', 'percentage', 10.0, 5000, 3000, true),
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'SUMMER2026', 'percentage', 15.0, 15000, 5000, true),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 'FLASH500', 'fixed', 500.0, 3000, 500, true)
ON CONFLICT (id) DO UPDATE
SET
  code = EXCLUDED.code,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_order_amount = EXCLUDED.min_order_amount,
  is_active = EXCLUDED.is_active;

-- =========================================================================
-- SEED DATA: REVIEWS
-- =========================================================================
INSERT INTO public.reviews (id, product_id, rating, comment, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 5.0, 'অসাধারণ সার্ভিস! অর্ডার করার মাত্র ৩ ঘণ্টার মধ্যে ধানমন্ডিতে হোম ডেলিভারি পেয়েছি। ১০০% ইনট্যাক্ট অফিশিয়াল ডিভাইস।', NOW() - INTERVAL '2 days'),
  ('d0000000-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-000000000010'::uuid, 5.0, 'MSI Mobile থেকে প্রথমবার অর্ডার করেছিলাম। নয়েজ ক্যান্সেলেশন অনবদ্য। bKash পেমেন্টে ডিসকাউন্ট পেয়েছি!', NOW() - INTERVAL '4 days'),
  ('d0000000-0000-0000-0000-000000000003'::uuid, 'a0000000-0000-0000-0000-000000000006'::uuid, 5.0, 'চট্টগ্রামে ২ দিনের মধ্যে সিকিউরড কাঠের ক্রেট প্যাকেজে ল্যাপটপ হাতে পেয়েছি। ২ বছরের অফিশিয়াল ওয়ারেন্টি কার্ড পেয়েছি।', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO UPDATE
SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment;
