CREATE TABLE payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods
    ADD CONSTRAINT unique_name UNIQUE (name);

CREATE POLICY "Payment methods are read-only for authenticated users"
ON payment_methods FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage payment methods"
ON payment_methods FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'admin'
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

-- トリガーを payment_methods テーブルに設定
CREATE TRIGGER set_timestamp
BEFORE INSERT OR UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();