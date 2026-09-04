-- Admin customer summary for the live UUID-based orders schema.

CREATE OR REPLACE VIEW public.admin_customers AS
SELECT
  customer_phone,
  (ARRAY_AGG(customer_name ORDER BY created_at DESC))[1]  AS customer_name,
  (ARRAY_AGG(customer_email ORDER BY created_at DESC))[1] AS customer_email,
  COUNT(*)::int                                            AS total_orders,
  COALESCE(SUM(total_amount), 0)                          AS total_spent,
  MAX(created_at)                                         AS last_order_at,
  MIN(created_at)                                         AS first_order_at
FROM public.orders
WHERE customer_phone IS NOT NULL
  AND customer_phone <> ''
  AND (
    coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    OR auth.role() = 'service_role'
    OR public.is_admin()
  )
GROUP BY customer_phone
ORDER BY total_spent DESC;

REVOKE ALL ON public.admin_customers FROM anon;
REVOKE ALL ON public.admin_customers FROM authenticated;
GRANT SELECT ON public.admin_customers TO authenticated;
GRANT SELECT ON public.admin_customers TO service_role;
