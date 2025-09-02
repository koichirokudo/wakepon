CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own profile." ON users
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = users.id);

CREATE POLICY "Users can update own profile." ON users 
    FOR UPDATE USING ((SELECT auth.uid()) = users.id);

-- supabase では auth.users テーブルにユーザー情報が保存される
-- ユーザー作成時に users テーブルにデータを挿入する
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    BEGIN
        -- nameが存在しない場合はemailの@より前の部分を使用する
        user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
        
        -- public.users にコピーする
        INSERT INTO public.users (id, name, created_at,updated_at) VALUES (NEW.id, user_name, now(), now());
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー作成時に handle_new_user 関数を実行するためのトリガーを定義
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを users テーブルに設定
CREATE TRIGGER set_timestamp
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();