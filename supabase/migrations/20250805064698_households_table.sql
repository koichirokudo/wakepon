CREATE TABLE households(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert household" ON households
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを households テーブルに設定
CREATE TRIGGER set_timestamp
BEFORE INSERT OR UPDATE ON households
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();