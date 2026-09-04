-- =========================================================================
-- MIGRATION: Fix "record 'v_variation_row' is not assigned yet" in create_order_atomic
-- =========================================================================
-- Bug Cause:
-- When an item without variations is processed, v_variation_id is NULL,
-- so v_variation_row (declared as RECORD) is never assigned a tuple.
-- In PL/pgSQL, evaluating v_variation_row.color in jsonb_build_object causes:
-- "record 'v_variation_row' is not assigned yet: The tuple structure of a not-yet-assigned record is indeterminate"
--
-- Fix:
-- 1. Declare v_variation_row as public.product_variations%ROWTYPE (strongly typed)
-- 2. Use explicit scalar variables (v_item_color, v_item_storage) initialized to NULL per loop
-- 3. Safely pass v_item_color and v_item_storage into jsonb_build_object
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
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product_id BIGINT;
  v_variation_id BIGINT;
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
  v_order_id BIGINT;
  v_order_number TEXT;
  v_coupon_record RECORD;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cannot create an empty order.';
  END IF;

  -- Generate unique order number
  v_order_number := 'MSI-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

  -- Process and lock each line item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::BIGINT;
    v_variation_id := CASE
      WHEN NULLIF(NULLIF(v_item->>'variation_id', 'null'), 'std') IS NULL THEN NULL
      ELSE (v_item->>'variation_id')::BIGINT
    END;
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

    -- Decrement base product aggregate stock
    UPDATE public.products
    SET stock = GREATEST(0, stock - v_quantity)
    WHERE id = v_product_id;

    v_line_total := v_line_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    -- Append to server-verified items array safely using initialized scalar variables
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
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (expires_at IS NULL OR expires_at > NOW())
    FOR UPDATE;

    IF FOUND THEN
      IF v_subtotal >= COALESCE(v_coupon_record.min_order_amount, 0) THEN
        IF v_coupon_record.discount_type = 'percentage' THEN
          v_discount := (v_subtotal * v_coupon_record.discount_value / 100.0);
          IF v_coupon_record.max_discount IS NOT NULL THEN
            v_discount := LEAST(v_discount, v_coupon_record.max_discount);
          END IF;
        ELSE
          v_discount := LEAST(v_coupon_record.discount_value, v_subtotal);
        END IF;

        UPDATE public.coupons
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_order_atomic TO anon, authenticated, service_role;
