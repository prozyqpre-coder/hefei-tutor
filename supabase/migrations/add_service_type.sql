-- 若 student_profiles 已存在，在 Supabase SQL Editor 中执行此条即可添加 service_type
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS service_type text CHECK (service_type IN ('offline', 'online'));
