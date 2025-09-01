CREATE TABLE household_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id uuid REFERENCES households(id),
    category_id uuid NOT NULL REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE household_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view household_categories in their household"
ON household_categories FOR SELECT
USING (
    household_categories.household_id IS NULL OR
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = household_categories.household_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert household_categories in their households"
ON household_categories
FOR INSERT
WITH CHECK (
    household_categories.household_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = household_categories.household_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update household_categories in their households"
ON household_categories 
FOR UPDATE 
USING (
    household_categories.household_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = household_categories.household_id
        AND user_id = auth.uid()
    )
)
WITH CHECK (
    household_categories.household_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = household_categories.household_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete household_categories in their households"
ON household_categories
FOR DELETE
USING (
    household_categories.household_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = household_categories.household_id
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
BEFORE INSERT OR UPDATE ON household_categories
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();