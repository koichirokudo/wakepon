CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id uuid REFERENCES households(id),
    name TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- household内で同名になってはいけない
ALTER TABLE categories
    ADD CONSTRAINT unique_category_name_per_household UNIQUE (household_id, name);

CREATE POLICY "Users can view categories in their households"
ON categories FOR SELECT
USING (
    household_id IS NULL OR
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = categories.household_id
        AND user_id = auth.uid()
    )
);

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