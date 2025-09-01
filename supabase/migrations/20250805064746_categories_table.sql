CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 共通カテゴリは全員参照可能
CREATE POLICY "Allow all to select categories"
ON categories FOR SELECT
USING (true);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを categories テーブルに設定
CREATE TRIGGER set_timestamp
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();