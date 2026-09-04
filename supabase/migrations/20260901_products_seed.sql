-- Live-schema compatibility migration.
-- Business records are already present in production; this file contains no seed data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- These definitions are only used for a new database. Existing live tables are untouched.
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

CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color TEXT,
  storage TEXT,
  sku TEXT UNIQUE,
  price NUMERIC(12, 2),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC(12, 2),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add only non-conflicting operational columns used by the current application.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price NUMERIC(12, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.product_variations ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_updates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- UUID-safe, stock-authoritative order creation. No seed data is included below.
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
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_variation_id UUID;
  v_product RECORD;
  v_variation RECORD;
  v_coupon RECORD;
  v_items JSONB := '[]'::jsonb;
  v_subtotal NUMERIC(12, 2) := 0;
  v_discount NUMERIC(12, 2) := 0;
  v_shipping NUMERIC(12, 2) := 0;
  v_total NUMERIC(12, 2);
  v_quantity INTEGER;
  v_unit_price NUMERIC(12, 2);
  v_order_id UUID;
  v_order_number TEXT;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cannot create an empty order.';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_variation_id := CASE
      WHEN NULLIF(NULLIF(NULLIF(TRIM(v_item->>'variation_id'), ''), 'null'), 'std') IS NULL THEN NULL
      ELSE (v_item->>'variation_id')::UUID
    END;
    v_quantity := COALESCE((v_item->>'quantity')::INTEGER, 1);

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Item quantity must be greater than zero.';
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % does not exist.', v_product_id;
    END IF;

    IF v_variation_id IS NOT NULL THEN
      SELECT * INTO v_variation
      FROM public.product_variations
      WHERE id = v_variation_id AND product_id = v_product_id
      FOR UPDATE;

      IF NOT FOUND OR v_variation.stock < v_quantity THEN
        RAISE EXCEPTION 'Insufficient variation stock for product %.', v_product.name;
      END IF;

      v_unit_price := COALESCE(v_variation.price, v_product.price);
      UPDATE public.product_variations
      SET stock = stock - v_quantity
      WHERE id = v_variation_id;
    ELSE
      IF v_product.stock < v_quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product %.', v_product.name;
      END IF;

      v_unit_price := v_product.price;
    END IF;

    UPDATE public.products
    SET stock = GREATEST(0, stock - v_quantity)
    WHERE id = v_product_id;

    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
    v_items := v_items || jsonb_build_object(
      'product_id', v_product_id,
      'variation_id', v_variation_id,
      'product_name', v_product.name,
      'unit_price', v_unit_price,
      'quantity', v_quantity,
      'line_total', v_unit_price * v_quantity,
      'image_url', CASE
        WHEN v_variation_id IS NOT NULL THEN v_variation.image_url
        ELSE v_product.images[1]
      END
    );
  END LOOP;

  IF p_shipping_address->>'district' ILIKE '%dhaka%' THEN
    v_shipping := 60;
  ELSE
    v_shipping := 120;
  END IF;

  IF NULLIF(TRIM(p_coupon_code), '') IS NOT NULL THEN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE UPPER(code) = UPPER(TRIM(p_coupon_code))
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    FOR UPDATE;

    IF FOUND AND v_subtotal >= COALESCE(v_coupon.min_order_amount, 0) THEN
      IF v_coupon.discount_type = 'percentage' THEN
        v_discount := v_subtotal * v_coupon.discount_value / 100;
        IF v_coupon.max_discount_amount IS NOT NULL THEN
          v_discount := LEAST(v_discount, v_coupon.max_discount_amount);
        END IF;
      ELSE
        v_discount := LEAST(v_subtotal, v_coupon.discount_value);
      END IF;
    END IF;
  END IF;

  v_total := GREATEST(0, v_subtotal - v_discount + v_shipping);
  v_order_number := 'MSI-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  INSERT INTO public.orders (
    user_id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, items, subtotal, shipping_fee, discount_amount,
    total_amount, status, order_status, payment_method, payment_status,
    coupon_code, tracking_updates
  ) VALUES (
    p_user_id, v_order_number, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, v_items, v_subtotal, v_shipping, v_discount,
    v_total, 'confirmed', 'confirmed', p_payment_method,
    CASE WHEN p_payment_method = 'COD' THEN 'unpaid' ELSE 'paid' END,
    p_coupon_code, '[]'::jsonb
  )
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'shipping', v_shipping,
    'total', v_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_atomic(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT, TEXT)
  TO anon, authenticated, service_role;
