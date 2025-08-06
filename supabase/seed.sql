-- ユーザー（認証IDと一致させる場合はauth.uid()で得られるUUIDを使う）
INSERT INTO users (id, name, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'テスト太郎', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'テスト花子', now(), now());

-- 🏠 household
INSERT INTO households (id, name, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'テスト世帯', now(), now());

-- household_members
INSERT INTO household_members (id, household_id, user_id, created_at, updated_at)
VALUES
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', now(), now()),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', now(), now());

-- household専用カテゴリ（カスタム）
INSERT INTO categories (id, household_id, name, is_custom, created_at, updated_at)
VALUES
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '猫用品', true, now(), now());

-- 共通支払方法
INSERT INTO payment_methods (id, household_id, name, is_custom, created_at, updated_at)
VALUES
  (gen_random_uuid(), NULL, '現金', false, now(), now()),
  (gen_random_uuid(), NULL, 'クレジットカード', false, now(), now()),
  (gen_random_uuid(), NULL, 'PayPay', false, now(), now());

-- household専用支払方法
INSERT INTO payment_methods (id, household_id, name, is_custom, created_at, updated_at)
VALUES
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '夫婦財布', true, now(), now());

-- expenses（仮にすべての参照IDを上から取得した場合）
-- ※ 実際には、insert後にIDを取得して使うか、定数IDで管理することを推奨

-- ここはカテゴリIDや支払方法IDをselectして一時変数に入れるか、先に固定IDで入れておく必要あり
-- 本格的に作るなら WITH句や CTEを使ってもOK
-- カテゴリ（共通・カスタム）
INSERT INTO categories (id, household_id, name, is_custom, created_at, updated_at) VALUES (gen_random_uuid(), NULL, '食費', false, '2025-08-06T03:05:13.418225', '2025-08-06T03:05:13.418225');
INSERT INTO categories (id, household_id, name, is_custom, created_at, updated_at) VALUES (gen_random_uuid(), NULL, '日用品', false, '2025-08-06T03:05:13.418225', '2025-08-06T03:05:13.418225');
INSERT INTO categories (id, household_id, name, is_custom, created_at, updated_at) VALUES (gen_random_uuid(), NULL, '水道', false, '2025-08-06T03:05:13.418225', '2025-08-06T03:05:13.418225');
INSERT INTO categories (id, household_id, name, is_custom, created_at, updated_at) VALUES (gen_random_uuid(), NULL, '電気', false, '2025-08-06T03:05:13.418225', '2025-08-06T03:05:13.418225');
INSERT INTO categories (id, household_id, name, is_custom, created_at, updated_at) VALUES (gen_random_uuid(), NULL, 'ガス', false, '2025-08-06T03:05:13.418225', '2025-08-06T03:05:13.418225');
INSERT INTO categories (id, household_id, name, is_custom, created_at, updated_at) VALUES (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '猫用品', true, '2025-08-06T03:05:13.418225', '2025-08-06T03:05:13.418225');
INSERT INTO categories (id, household_id, name, is_custom, created_at, updated_at) VALUES (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'オタ活', true, '2025-08-06T03:05:13.418225', '2025-08-06T03:05:13.418225')