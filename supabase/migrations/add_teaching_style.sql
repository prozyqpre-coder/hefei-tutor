-- 为 tutor_posts 新增授课风格/教师寄语字段（可选）
ALTER TABLE public.tutor_posts
ADD COLUMN IF NOT EXISTS teaching_style text;

COMMENT ON COLUMN public.tutor_posts.teaching_style IS '授课风格/教师寄语，可选';
