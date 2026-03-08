-- Enable Row Level Security (RLS) on relevant tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'users' (Reps): Can only SELECT, INSERT, UPDATE their own records

-- Clients Table
DROP POLICY IF EXISTS "Reps can manage their own clients." ON public.clients;
CREATE POLICY "Reps can manage their own clients." ON public.clients
FOR ALL USING (auth.uid() = assigned_to_rep_id) WITH CHECK (auth.uid() = assigned_to_rep_id);

-- Sales Table
DROP POLICY IF EXISTS "Reps can manage their own sales." ON public.sales;
CREATE POLICY "Reps can manage their own sales." ON public.sales
FOR ALL USING (auth.uid() = rep_id) WITH CHECK (auth.uid() = rep_id);

-- Activities Table
DROP POLICY IF EXISTS "Reps can manage their own activities." ON public.activities;
CREATE POLICY "Reps can manage their own activities." ON public.activities
FOR ALL USING (auth.uid() = rep_id) WITH CHECK (auth.uid() = rep_id);

-- Profiles Table (Reps can view their own profile and update it)
DROP POLICY IF EXISTS "Reps can view and update their own profile." ON public.profiles;
CREATE POLICY "Reps can view and update their own profile." ON public.profiles
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Policies for 'managers' / 'admins': Can SELECT all records, but INSERT/UPDATE based on their role where applicable.
-- Assuming 'role' is a column in the 'profiles' table.
-- For simplicity, let's assume 'admin' role has full read access and can manage all records.
-- 'manager' role can read all, but only manage records assigned to their subordinates. (This would require specific logic, so for now, I'll simplify it to similar to 'admin' for read-all, and specific insert/update later).

-- Create a helper function to check if the current user is an admin (assuming 'role' column in profiles table)
-- You would need to add 'role' column to your profiles table for this to work
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Use SECURITY DEFINER to execute with definer's privileges
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin');
END;
$$;

-- Clients Table (Admin can see all, manage all)
DROP POLICY IF EXISTS "Admin can view and manage all clients." ON public.clients;
CREATE POLICY "Admin can view and manage all clients." ON public.clients
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Sales Table (Admin can see all, manage all)
DROP POLICY IF EXISTS "Admin can view and manage all sales." ON public.sales;
CREATE POLICY "Admin can view and manage all sales." ON public.sales
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Activities Table (Admin can see all, manage all)
DROP POLICY IF EXISTS "Admin can view and manage all activities." ON public.activities;
CREATE POLICY "Admin can view and manage all activities." ON public.activities
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Profiles Table (Admin can view and manage all profiles)
DROP POLICY IF EXISTS "Admin can view and manage all profiles." ON public.profiles;
CREATE POLICY "Admin can view and manage all profiles." ON public.profiles
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Important Note on Policy Order:
-- Supabase applies policies in a specific order. If multiple policies are defined, the most permissive one might take precedence.
-- To avoid conflicts, ensure that more restrictive policies are applied first or combined carefully.
-- In this setup, "Reps can manage their own..." policies apply first. If the user is an admin, then "Admin can view and manage all..." policies would also apply, effectively giving admins broader access. This is generally the desired behavior.