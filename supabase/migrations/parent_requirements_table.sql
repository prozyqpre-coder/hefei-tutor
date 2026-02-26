-- 家长需求表（与 parent_jobs 并列，用于结构化发布：年级单选、科目多选、授课区域+详细地址）
CREATE TABLE IF NOT EXISTS public.parent_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id text,
  CONSTRAINT parent_requirements_one_owner CHECK (
    (parent_id IS NOT NULL AND client_user_id IS NULL) OR
    (parent_id IS NULL AND client_user_id IS NOT NULL)
  ),
  teach_mode text NOT NULL CHECK (teach_mode IN ('offline', 'online')),
  region text,
  detail_address text,
  grade text NOT NULL,
  subjects text[],
  extra_note text,
  price_range text,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MATCHING', 'CLOSED')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.parent_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "家长可插入自己的需求"
  ON public.parent_requirements FOR INSERT
  WITH CHECK (parent_id IS NOT NULL AND auth.uid() = parent_id);

CREATE POLICY "家长可更新自己的需求"
  ON public.parent_requirements FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "所有人可读开放中的需求"
  ON public.parent_requirements FOR SELECT
  USING (status IN ('OPEN', 'MATCHING'));

COMMENT ON TABLE public.parent_requirements IS '家长发布的结构化找家教需求：年级单选、科目多选、区域+详细地址';
COMMENT ON COLUMN public.parent_requirements.region IS '授课区域（合肥九区三县，线下时必选）';
COMMENT ON COLUMN public.parent_requirements.detail_address IS '详细地址（路名或小区名）';
COMMENT ON COLUMN public.parent_requirements.extra_note IS '额外备注（教员性别、上课时间等）';
