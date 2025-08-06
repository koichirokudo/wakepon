CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

create policy "Users can view their own profile and group." on users
    for select using (true);

create policy "Users can insert their own profile." on users
    for insert with check ((select auth.uid()) = users.id);

create policy "Users can update own profile." on users 
    for update using ((select auth.uid()) = users.id);