CREATE TABLE household_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id uuid REFERENCES households(id),
    user_id uuid REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members 
    ADD CONSTRAINT unique_user_per_household UNIQUE (household_id, user_id);

-- SELECT: 自分だけが見れる
CREATE POLICY "Users can view their own household memberships" 
    ON household_members 
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: 自分だけが自分の household_members に追加できる
CREATE POLICY "Users can insert themselves into a household"
    ON household_members
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを household_members テーブルに設定
CREATE TRIGGER set_timestamp
BEFORE INSERT OR UPDATE ON household_members
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();