CREATE TABLE expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id uuid NOT NULL REFERENCES households(id),
    user_id uuid NOT NULL REFERENCES users(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount integer NOT NULL DEFAULT 0,
    category_id uuid NOT NULL REFERENCES categories(id),
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses in their households"
ON expenses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = expenses.household_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert expenses in their households"
ON expenses 
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = expenses.household_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update expenses in their households"
ON expenses 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = expenses.household_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete expenses in their households"
ON expenses 
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = expenses.household_id
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

-- トリガーを expenses テーブルに設定
CREATE TRIGGER set_timestamp
BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();