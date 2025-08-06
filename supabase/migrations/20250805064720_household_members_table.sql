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

CREATE POLICY "Users can view their own household memberships"
  ON household_members
  FOR SELECT
  USING (user_id = auth.uid());
