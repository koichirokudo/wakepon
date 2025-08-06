CREATE TABLE households(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;

create policy "Users can view their own profile and group." on households
    for select using (true);
