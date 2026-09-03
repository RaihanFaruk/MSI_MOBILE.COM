-- =========================================================================
-- Fix Orders Admin RLS Update & Select Policies
-- Migration Date: 2026-09-06
-- =========================================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop legacy conflicting policies if they exist
DROP POLICY IF EXISTS "Admins Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update and manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders or admins can view all" ON public.orders;
DROP POLICY IF EXISTS "Admins Read All Orders" ON public.orders;
DROP POLICY IF EXISTS "Users Read Own Orders" ON public.orders;

-- 1. Permissive Admin & Self Select Policy
CREATE POLICY "Orders Select Policy" ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    user_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. Robust Admin Update Policy
CREATE POLICY "Admins Update Orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
