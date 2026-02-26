-- 家长需求表：region、grade 改为多选数组，与 student_profiles 对称
ALTER TABLE public.parent_requirements
  ALTER COLUMN region TYPE text[] USING (CASE WHEN region IS NULL OR region = '' THEN NULL ELSE array[region]::text[] END);
ALTER TABLE public.parent_requirements
  ALTER COLUMN grade DROP NOT NULL;
ALTER TABLE public.parent_requirements
  ALTER COLUMN grade TYPE text[] USING (CASE WHEN grade IS NULL OR grade = '' THEN NULL ELSE array[grade]::text[] END);
