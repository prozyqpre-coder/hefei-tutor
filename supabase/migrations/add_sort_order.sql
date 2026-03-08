-- 信息位置排序：数值越大越靠前，同值按 created_at 倒序
ALTER TABLE tutor_posts  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE demand_posts ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- 可选：为排序查询建索引
CREATE INDEX IF NOT EXISTS idx_tutor_posts_sort_created  ON tutor_posts (sort_order DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demand_posts_sort_created ON demand_posts (sort_order DESC, created_at DESC);
