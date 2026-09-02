-- =========================================================================
-- Supabase PostgreSQL Migration: MSI MOBILE Admin RLS Policies & Roles
-- Target: Enable full CRUD for authenticated users with role = 'admin'
-- =========================================================================

-- 1. Ensure missing profile columns (address, district) exist for sync
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district TEXT;

-- 2. Ensure is_admin() function exists and is robust (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO anon, authenticated, service_role;

-- 3. Drop any conflicting existing admin policies to ensure clean re-run
DROP POLICY IF EXISTS "Admins Insert Products" ON public.products;
DROP POLICY IF EXISTS "Admins Update Products" ON public.products;
DROP POLICY IF EXISTS "Admins Delete Products" ON public.products;

DROP POLICY IF EXISTS "Admins Insert Categories" ON public.categories;
DROP POLICY IF EXISTS "Admins Update Categories" ON public.categories;
DROP POLICY IF EXISTS "Admins Delete Categories" ON public.categories;

DROP POLICY IF EXISTS "Admins Insert Product Variations" ON public.product_variations;
DROP POLICY IF EXISTS "Admins Update Product Variations" ON public.product_variations;
DROP POLICY IF EXISTS "Admins Delete Product Variations" ON public.product_variations;

DROP POLICY IF EXISTS "Admins Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Admins Read All Orders" ON public.orders;

DROP POLICY IF EXISTS "Admins Manage Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users Read Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;

-- =========================================================================
-- PRODUCTS TABLE: Admin Write Policies (INSERT, UPDATE, DELETE)
-- =========================================================================
CREATE POLICY "Admins Insert Products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins Update Products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins Delete Products" ON public.products
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- CATEGORIES TABLE: Admin Write Policies (INSERT, UPDATE, DELETE)
-- =========================================================================
CREATE POLICY "Admins Insert Categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins Update Categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins Delete Categories" ON public.categories
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- PRODUCT VARIATIONS TABLE: Admin Write Policies (INSERT, UPDATE, DELETE)
-- =========================================================================
CREATE POLICY "Admins Insert Product Variations" ON public.product_variations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins Update Product Variations" ON public.product_variations
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins Delete Product Variations" ON public.product_variations
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- ORDERS TABLE: Admin Read & Update Policies
-- =========================================================================
CREATE POLICY "Admins Update Orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins Read All Orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- PROFILES TABLE: Self Read/Update & Admin All
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users Read Own Profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users Update Own Profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins Manage Profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin());
