-- +goose Up
-- Minimal RLS test: per-owner visibility on a tiny table
CREATE TABLE IF NOT EXISTS public.rls_test (
    id serial PRIMARY KEY,
    owner uuid NOT NULL,
    content text
);

ALTER TABLE public.rls_test ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_test_owner_select" ON public.rls_test;

CREATE POLICY "rls_test_owner_select" ON public.rls_test FOR
SELECT
    USING (auth.uid () = owner);

DROP POLICY IF EXISTS "rls_test_owner_insert" ON public.rls_test;

CREATE POLICY "rls_test_owner_insert" ON public.rls_test FOR INSERT
WITH
    CHECK (auth.uid () = owner);

-- +goose Down
-- Drop the test table and its policies
DROP POLICY IF EXISTS "rls_test_owner_insert" ON public.rls_test;

DROP POLICY IF EXISTS "rls_test_owner_select" ON public.rls_test;

ALTER TABLE IF EXISTS public.rls_test DISABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS public.rls_test;