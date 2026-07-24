-- Without RLS enabled, PostgREST allows full read/write through the
-- publishable (anon) key with no restriction at all -- that's the current
-- state, and it's wider than intended even though nothing untoward has
-- happened yet. Nothing today queries Supabase directly from the browser
-- (the frontend only ever talks to our own Next.js API routes, which use
-- the service_role key and bypass RLS entirely), but the publishable key
-- is still meant to be safe to expose, so it should behave that way now,
-- not just by accident of current usage.

alter table licenses enable row level security;
alter table license_events enable row level security;
alter table ingestion_runs enable row level security;

-- Public license/regulatory data -- the whole point of the project is
-- public transparency, so readable by anyone (the publishable key).
create policy "licenses are publicly readable"
  on licenses for select
  to anon, authenticated
  using (true);

create policy "license_events are publicly readable"
  on license_events for select
  to anon, authenticated
  using (true);

-- ingestion_runs is internal job-observability metadata, not
-- user-facing data -- no public policy, so only service_role
-- (which bypasses RLS) can read or write it.

-- No insert/update/delete policies anywhere: only service_role
-- (the ingestion job) can write, since it bypasses RLS by design.
