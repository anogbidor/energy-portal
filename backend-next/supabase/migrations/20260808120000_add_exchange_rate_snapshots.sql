-- Backs the up/down trend arrows next to USD/EUR/GBP-TRY. live-data.ts
-- only ever cached the latest fetched rate for an hour -- nothing was
-- persisted day-over-day, so there was no real "yesterday" to compare
-- against. One row per (pair, day); the trend is derived by comparing
-- today's snapshot to the most recent earlier one.
create table if not exists exchange_rate_snapshots (
  id uuid primary key default gen_random_uuid(),
  pair text not null,        -- 'usdTry' | 'eurTry' | 'gbpTry'
  value numeric not null,
  snapshot_date date not null,
  created_at timestamptz not null default now(),
  unique (pair, snapshot_date)
);

create index if not exists exchange_rate_snapshots_lookup_idx
  on exchange_rate_snapshots (pair, snapshot_date desc);

alter table exchange_rate_snapshots enable row level security;

create policy "exchange_rate_snapshots is publicly readable"
  on exchange_rate_snapshots for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies: only service_role (the snapshot
-- cron) can write, since it bypasses RLS by design.
