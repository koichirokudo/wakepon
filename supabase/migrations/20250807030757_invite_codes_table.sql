CREATE TABLE invite_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id uuid NOT NULL REFERENCES households(id),
    email TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read valid invite codes"
ON invite_codes
FOR SELECT
USING (
  is_used = FALSE AND
  expires_at > now()
);

-- UPDATE: household_members のみが invite_codes を更新できる
CREATE POLICY "Users can update their own invite codes"
ON invite_codes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = invite_codes.household_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = invite_codes.household_id
    AND user_id = auth.uid()
  )
);

-- INSERT: household_members のみが invite_codes を追加できる
CREATE POLICY "Household members can insert invite codes"
ON invite_codes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = invite_codes.household_id
    AND user_id = auth.uid()
  )
);

-- 招待コードを使用する関数
CREATE OR REPLACE FUNCTION public.use_invite_code(
  p_user_id uuid,
  p_invite_code text
)
RETURNS void AS
$$
DECLARE
  v_invite_record invite_codes%ROWTYPE;
BEGIN
  -- 招待コード取得・存在チェック・未使用チェック・期限チェック
  SELECT * INTO v_invite_record
  FROM invite_codes
  WHERE code = p_invite_code
    AND is_used = FALSE
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already used invite code';
  END IF;

  -- household_members にユーザー追加（重複は無視するかエラーにする）
  INSERT INTO household_members (user_id, household_id)
  VALUES (p_user_id, v_invite_record.household_id)
  ON CONFLICT DO NOTHING;

  -- 招待コードを使用済みに更新
  UPDATE invite_codes
  SET is_used = TRUE
  WHERE id = v_invite_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
