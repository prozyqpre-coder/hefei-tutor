-- 在 Supabase Dashboard → SQL Editor 中执行此脚本创建表

-- 大学生资料表（user_id 为 Supabase Auth；client_user_id 为模拟微信登录）
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id text,
  real_name text,
  degree text CHECK (degree IN ('本科', '研究生')),
  auth_files text[],
  service_type text CHECK (service_type IN ('offline', 'online')),
  university text,
  teach_mode text,
  region text[],
  grade text[],
  min_price numeric,
  max_price numeric,
  subjects text[],
  address text,
  status text NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'pending_review', 'APPROVED')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT one_user_per_profile CHECK (
    (user_id IS NOT NULL AND client_user_id IS NULL) OR
    (user_id IS NULL AND client_user_id IS NOT NULL)
  )
);
CREATE UNIQUE INDEX student_profiles_user_id_key ON public.student_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX student_profiles_client_user_id_key ON public.student_profiles(client_user_id) WHERE client_user_id IS NOT NULL;

-- 若表已存在，可单独执行以添加 service_type 字段：
-- ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS service_type text CHECK (service_type IN ('offline', 'online'));

-- 允许已登录用户插入自己的资料，允许所有人读取 APPROVED 的资料
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可插入自己的 student_profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "用户可更新自己的 student_profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "所有人可读已审核通过的资料"
  ON public.student_profiles FOR SELECT
  USING (status = 'APPROVED' OR auth.uid() = user_id);

-- 家长发布岗位表（找家教需求；parent_id 为真实登录用户，client_user_id 为模拟登录）
CREATE TABLE IF NOT EXISTS public.parent_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id text,
  CONSTRAINT parent_jobs_one_owner CHECK (
    (parent_id IS NOT NULL AND client_user_id IS NULL) OR
    (parent_id IS NULL AND client_user_id IS NOT NULL)
  ),
  teach_mode text NOT NULL CHECK (teach_mode IN ('offline', 'online')),
  address text NOT NULL,
  issue_desc text,
  subjects text[],
  price_range text,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MATCHING', 'CLOSED')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.parent_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "家长可插入自己的岗位"
  ON public.parent_jobs FOR INSERT
  WITH CHECK (parent_id IS NOT NULL AND auth.uid() = parent_id);

CREATE POLICY "家长可更新自己的岗位"
  ON public.parent_jobs FOR UPDATE
  USING (parent_id = auth.uid());

CREATE POLICY "所有人可读开放中的岗位"
  ON public.parent_jobs FOR SELECT
  USING (status IN ('OPEN', 'MATCHING'));

-- 系统通知表（审核通过等，由 service_role 插入）
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_client_user_id_idx ON public.notifications(client_user_id) WHERE client_user_id IS NOT NULL;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户可读自己的通知"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
