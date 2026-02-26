-- 1. student_profiles 状态扩展：incomplete（仅注册未交证件）、pending_review（待审核）、APPROVED（通过）
UPDATE public.student_profiles SET status = 'pending_review' WHERE status = 'PENDING';

ALTER TABLE public.student_profiles
  DROP CONSTRAINT IF EXISTS student_profiles_status_check;

ALTER TABLE public.student_profiles
  ADD CONSTRAINT student_profiles_status_check
  CHECK (status IN ('incomplete', 'pending_review', 'APPROVED'));

ALTER TABLE public.student_profiles
  ALTER COLUMN status SET DEFAULT 'incomplete';

-- 2. 证件存储桶 verification：若下方 INSERT 报错，请在 Dashboard → Storage 手动创建名为 verification 的 Private 桶
--    策略：已登录用户可上传到以自己 user_id 为名的目录；模拟用户由 API 用 service_role 上传到 client_user_id 目录
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification', 'verification', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "用户可上传自己的证件到 verification"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "用户可读自己 verification 下的文件"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
