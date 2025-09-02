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

-- 42P17 無限再帰エラーを回避するために、関数に切り出してポリシーを作成する
-- 無限再帰エラーはポリシー内で同じテーブル（household_members）を参照しているため
-- PostgreSQLが無限ループするエラー
-- Supabase では Create view を使うよりも関数に切り出すほうが多いらしい
-- TODO: この問題は結構詰まったので、テストコードでRLSのチェックのコードを作成する
CREATE OR REPLACE FUNCTION user_in_household(hid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = hid AND user_id = auth.uid()
  );
$$;
COMMENT ON FUNCTION user_in_household(uuid) IS 'Check if the current user belongs to the given household_id';

-- 上記の関数を使ってポリシーを作成する
CREATE POLICY "Members can view their own household members"
ON household_members
FOR SELECT
USING (user_in_household(household_id));

-- SELECT: 認証済ユーザーは世帯情報を見れる(househodlsテーブル)
CREATE POLICY "Users can view their households" ON households FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM household_members 
    WHERE household_id = households.id AND user_id = auth.uid()
  )
);

-- SELECT: 自分自身、または同じ household に属している人しか見えない(users table)
CREATE POLICY "Users can view members of same household" ON users
FOR SELECT USING (
    id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM household_members hm1
        JOIN household_members hm2 ON hm1.household_id = hm2.household_id
        WHERE hm1.user_id = auth.uid()
        AND hm2.user_id = users.id
    )
);

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