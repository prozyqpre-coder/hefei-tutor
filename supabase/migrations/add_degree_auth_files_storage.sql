-- 1. student_profiles 增加 degree、auth_files
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS degree text CHECK (degree IN ('本科', '研究生'));

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS auth_files text[];

COMMENT ON COLUMN public.student_profiles.degree IS '学历：本科/研究生';
COMMENT ON COLUMN public.student_profiles.auth_files IS '学信网/学生证等审核材料 URL 数组，仅管理员可见';

-- 2. Storage 桶：请在 Supabase Dashboard → Storage → New bucket 创建名为 student-auth-files 的桶，设为 Private。
--    若项目支持通过 SQL 创建桶，可执行：
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('student-auth-files', 'student-auth-files', false)
-- ON CONFLICT (id) DO NOTHING;

-- 已登录用户可上传到以自己 user_id 为前缀的路径下
CREATE POLICY "用户可上传自己的审核材料"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-auth-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 用户可读自己上传的文件
CREATE POLICY "用户可读自己的审核材料"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-auth-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 管理员/服务端可通过 service_role 访问全部（无需单独 policy）
