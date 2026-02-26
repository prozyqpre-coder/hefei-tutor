-- 支持「模拟微信一键登录」：用 client_user_id 存 wx_user_xxx，user_id 改为可空
-- 在 Supabase SQL Editor 中执行（若表已存在）

-- 1. 新增列
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS client_user_id text;

-- 2. user_id 改为可空并去掉外键
ALTER TABLE public.student_profiles
  ALTER COLUMN user_id DROP NOT NULL;

-- 3. 删除原有外键与唯一约束（名称以实际报错为准，常见如下）
DO $$
BEGIN
  ALTER TABLE public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_user_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
ALTER TABLE public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_user_id_key;

-- 4. 唯一约束：真实用户每人一条、模拟用户每人一条
CREATE UNIQUE INDEX IF NOT EXISTS student_profiles_user_id_unique
  ON public.student_profiles(user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS student_profiles_client_user_id_unique
  ON public.student_profiles(client_user_id) WHERE client_user_id IS NOT NULL;

-- 5. RLS：SELECT 时允许按 client_user_id 查（需在请求中带 client_user_id，通常由服务端 API 用 service_role 查）
-- 插入仍仅允许 auth.uid() = user_id；模拟用户通过服务端 API 用 service_role 插入，不走 RLS
-- 无需新增 policy，保持现状即可
COMMENT ON COLUMN public.student_profiles.client_user_id IS '模拟微信登录时的用户标识，如 wx_user_xxx';
