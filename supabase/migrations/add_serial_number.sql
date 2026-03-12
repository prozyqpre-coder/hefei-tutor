-- 为教员和需求添加编号字段（管理员手动输入）
ALTER TABLE tutor_posts ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE demand_posts ADD COLUMN IF NOT EXISTS serial_number TEXT;
