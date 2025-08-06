CREATE TABLE payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods
    ADD CONSTRAINT unique_name UNIQUE (name);

CREATE POLICY "Enable access to authenticated users only"
ON "public"."payment_methods"
TO public
USING (
    (auth.uid() IS NOT NULL)
);
