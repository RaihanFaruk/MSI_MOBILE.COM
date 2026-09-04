-- Ensure updated_at column exists on public.orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Atomic admin bulk order status and payment-status update for UUID order IDs.

CREATE OR REPLACE FUNCTION public.admin_bulk_update_orders(
  p_order_ids UUID[],
  p_status TEXT DEFAULT NULL,
  p_payment_status TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  IF NOT (
    coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    OR auth.role() = 'service_role'
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'Administrator permissions required.';
  END IF;

  IF p_status IS NULL AND p_payment_status IS NULL THEN
    RAISE EXCEPTION 'At least one order status must be provided.';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN (
    'pending', 'confirmed', 'processing', 'shipped',
    'out_for_delivery', 'delivered', 'cancelled', 'returned'
  ) THEN
    RAISE EXCEPTION 'Invalid fulfillment status.';
  END IF;

  IF p_payment_status IS NOT NULL AND p_payment_status NOT IN ('unpaid', 'paid', 'refunded') THEN
    RAISE EXCEPTION 'Invalid payment status.';
  END IF;

  WITH selected_orders AS (
    SELECT id, status, order_status, tracking_updates
    FROM public.orders
    WHERE id = ANY(p_order_ids)
    FOR UPDATE
  )
  UPDATE public.orders AS orders
  SET status = COALESCE(p_status, orders.status),
      order_status = COALESCE(p_status, orders.order_status),
      payment_status = COALESCE(p_payment_status, orders.payment_status),
      updated_at = NOW(),
      tracking_updates = COALESCE(selected_orders.tracking_updates, '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'status', COALESCE(p_status, selected_orders.status, selected_orders.order_status),
          'payment_status', p_payment_status,
          'message', 'Order updated by bulk admin action',
          'timestamp', NOW(),
          'updated_by', 'Administrator'
        )
      )
  FROM selected_orders
  WHERE orders.id = selected_orders.id;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_bulk_update_orders(UUID[], TEXT, TEXT)
  TO authenticated, service_role;