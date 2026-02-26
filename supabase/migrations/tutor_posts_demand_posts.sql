-- 教员帖子表（多选存数组，统一 status）
CREATE TABLE IF NOT EXISTS public.tutor_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id text,
  real_name text,
  university text NOT NULL,
  identity text NOT NULL CHECK (identity IN ('本科生', '研究生')),
  mode text NOT NULL CHECK (mode IN ('线上', '合肥线下')),
  region text[] NOT NULL DEFAULT '{}',
  grade text[] NOT NULL DEFAULT '{}',
  subjects text[] NOT NULL DEFAULT '{}',
  min_salary numeric,
  max_salary numeric,
  note text,
  auth_files text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tutor_posts_user_id ON public.tutor_posts(user_id);
CREATE INDEX IF NOT EXISTS tutor_posts_status ON public.tutor_posts(status);
CREATE INDEX IF NOT EXISTS tutor_posts_created_at ON public.tutor_posts(created_at DESC);

ALTER TABLE public.tutor_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tutor_posts_insert_own"
  ON public.tutor_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tutor_posts_select_all"
  ON public.tutor_posts FOR SELECT USING (true);
CREATE POLICY "tutor_posts_update_own"
  ON public.tutor_posts FOR UPDATE USING (auth.uid() = user_id);

-- 家长需求帖子表
CREATE TABLE IF NOT EXISTS public.demand_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id text,
  mode text NOT NULL CHECK (mode IN ('线上', '合肥线下')),
  region text,
  detail_address text,
  grade text[] NOT NULL DEFAULT '{}',
  subjects text[] NOT NULL DEFAULT '{}',
  budget numeric,
  note text,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demand_posts_status ON public.demand_posts(status);
CREATE INDEX IF NOT EXISTS demand_posts_created_at ON public.demand_posts(created_at DESC);

ALTER TABLE public.demand_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demand_posts_insert_own"
  ON public.demand_posts FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "demand_posts_select_open"
  ON public.demand_posts FOR SELECT USING (status = 'OPEN' OR auth.uid() = parent_id);
CREATE POLICY "demand_posts_update_own"
  ON public.demand_posts FOR UPDATE USING (auth.uid() = parent_id);

COMMENT ON COLUMN public.tutor_posts.status IS 'pending=待审核 verified=实名认证 rejected=打回';
COMMENT ON COLUMN public.tutor_posts.auth_files IS '学信网截图+学生证等 URL 数组';
