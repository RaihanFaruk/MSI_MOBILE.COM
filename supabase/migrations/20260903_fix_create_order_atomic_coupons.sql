-- Migration: Fix create_order_atomic coupons column references (valid_until, max_discount_amount)
-- Date: 2026-09-03

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
  v_order_id UUID := gen_random_uuid();
  v_order_number TEXT;
  v_item JSONB;
  v_product_id INT;
  v_variation_id INT;
  v_qty INT;
  v_price NUMERIC;
  v_stock INT;
  v_product_row public.products%ROWTYPE;
  v_variation_row public.product_variations%ROWTYPE;
  v_item_name TEXT;
  v_item_color TEXT;
  v_item_storage TEXT;
  v_subtotal NUMERIC := 0;
  v_discount NUMERIC := 0;
  v_shipping NUMERIC := 0;
  v_grand_total NUMERIC := 0;
  v_order_items JSONB := '[]'::JSONB;
  v_coupon_record RECORD;
BEGIN
  -- Generate order number (e.g. MSI-20260903-XXXX)
  v_order_number := 'MSI-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Iterate through order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::INT;
    v_variation_id := NULLIF(v_item->>'variation_id', '')::INT;
    v_qty := COALESCE((v_item->>'quantity')::INT, 1);
    v_item_color := NULL;
    v_item_storage := NULL;

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Item quantity must be greater than zero.';
    END IF;

    -- Lock and verify base product
    SELECT * INTO v_product_row
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % does not exist.', v_product_id;
    END IF;

    v_item_name := v_product_row.name;
    v_price := v_product_row.price;
    v_stock := v_product_row.stock;

    -- If item has variation, lock and verify variation stock
    IF v_variation_id IS NOT NULL THEN
      SELECT * INTO v_variation_row
      FROM public.product_variations
      WHERE id = v_variation_id AND product_id = v_product_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Variation with ID % does not exist for product %.', v_variation_id, v_product_id;
      END IF;

      v_item_color := v_variation_row.color;
      v_item_storage := v_variation_row.storage;
      v_price := COALESCE(v_variation_row.price, v_product_row.price);
      v_stock := v_variation_row.stock;

      IF v_stock < v_qty THEN
        RAISE EXCEPTION 'ERR_INSUFFICIENT_STOCK: Only % in stock for % (%).', v_stock, v_product_row.name, COALESCE(v_variation_row.color, 'Selected Option');
      END IF;

      -- Decrement variation stock
      UPDATE public.product_variations
      SET stock = stock - v_qty
      WHERE id = v_variation_id;

      -- Also decrement base product aggregate stock
      UPDATE public.products
      SET stock = GREATEST(0, stock - v_qty)
      WHERE id = v_product_id;
    ELSE
      -- Base product stock check
      IF v_stock < v_qty THEN
        RAISE EXCEPTION 'ERR_INSUFFICIENT_STOCK: Only % in stock for %.', v_stock, v_product_row.name;
      END IF;

      -- Decrement base product stock
      UPDATE public.products
      SET stock = stock - v_qty
      WHERE id = v_product_id;
    END IF;

    -- Accumulate subtotal
    v_subtotal := v_subtotal + (v_price * v_qty);

    -- Append to items ledger
    v_order_items := v_order_items || jsonb_build_array(
      jsonb_build_object(
        'product_id', v_product_id,
        'variation_id', v_variation_id,
        'product_name', v_item_name,
        'color', v_item_color,
        'storage', v_item_storage,
        'quantity', v_qty,
        'unit_price', v_price,
        'line_total', (v_price * v_qty)
      )
    );
  END LOOP;

  -- Calculate shipping fee from shipping address district
  IF (p_shipping_address->>'district') ILIKE '%dhaka%' THEN
    v_shipping := 60;
  ELSIF p_shipping_address->>'district' IS NOT NULL AND TRIM(p_shipping_address->>'district') <> '' THEN
    v_shipping := 120;
  ELSE
    v_shipping := 60;
  END IF;

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
        IF v_coupon_record.discount_type = 'percentage' OR v_coupon_record.discount_type = 'percent' THEN
          v_discount := (v_subtotal * v_coupon_record.discount_value / 100.0);
          IF v_coupon_record.max_discount_amount IS NOT NULL THEN
            v_discount := LEAST(v_discount, v_coupon_record.max_discount_amount);
          END IF;
        ELSE
          v_discount := LEAST(v_coupon_record.discount_value, v_subtotal);
        END IF;

        UPDATE public.coupons
        SET used_count = COALESCE(used_count, 0) + 1
        WHERE id = v_coupon_record.id;
      END IF;
    END IF;
  END IF;

  v_grand_total := GREATEST(0, v_subtotal - v_discount + v_shipping);

  -- Insert atomic order record
  INSERT INTO public.orders (
    id,
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
    payment_method,
    payment_status,
    status,
    created_at
  ) VALUES (
    v_order_id,
    p_user_id,
    v_order_number,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_shipping_address,
    v_order_items,
    v_subtotal,
    v_shipping,
    v_discount,
    v_grand_total,
    p_payment_method,
    'pending',
    'pending',
    NOW()
  );

  -- Return complete order summary JSON
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'shipping', v_shipping,
    'total', v_grand_total,
    'items_count', jsonb_array_length(v_order_items)
  );
END;
$$;
