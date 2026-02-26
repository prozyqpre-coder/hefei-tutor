-- 1. 新增 region (TEXT[])、grade (TEXT[])、min_price、max_price
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS region text[];

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS grade text[];

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS min_price numeric;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS max_price numeric;

-- 2. 将旧 area 数据迁移到 region（单值转数组）
UPDATE public.student_profiles
SET region = array[area]::text[]
WHERE area IS NOT NULL AND (region IS NULL OR region = '{}');

-- 3. 可选：删除旧列（若需保留兼容可跳过）
-- ALTER TABLE public.student_profiles DROP COLUMN IF EXISTS area;
-- ALTER TABLE public.student_profiles DROP COLUMN IF EXISTS price_range;

COMMENT ON COLUMN public.student_profiles.region IS '授课区域，多选（合肥九区三县一市或 线上/远程）';
COMMENT ON COLUMN public.student_profiles.grade IS '可授课年级，多选';
COMMENT ON COLUMN public.student_profiles.min_price IS '最低薪资（元/小时）';
COMMENT ON COLUMN public.student_profiles.max_price IS '最高薪资（元/小时）';
