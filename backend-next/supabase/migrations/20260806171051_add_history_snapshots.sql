-- Daily snapshot tables backing the price-trend and distributor
-- network-health charts. Neither existed before: live-data.ts only ever
-- served the current bulletin without persisting it, and dealer counts
-- were always computed live with no history. Both jobs are cheap and
-- run once a day -- price snapshots hit EPDK's separate bulletin
-- service, network snapshots only count rows already in our own DB, no
-- EPDK calls at all.

create table if not exists fuel_price_history (
  id uuid primary key default gen_random_uuid(),
  market text not null,       -- 'petrol' | 'lpg'
  yakit text not null,        -- EPDK's own fuel-type label, e.g. 'Kurşunsuz Benzin 95 Oktan'
  fiyat numeric not null,
  olcu_birimi text,
  tarih date not null,        -- the bulletin's own report date, not when we fetched it
  created_at timestamptz not null default now(),
  unique (market, yakit, tarih)
);

create index if not exists fuel_price_history_tarih_idx
  on fuel_price_history (market, yakit, tarih desc);

create table if not exists distributor_network_snapshots (
  id uuid primary key default gen_random_uuid(),
  market text not null,
  dagitici_lisans_no text not null,
  distributor_name text not null,
  active_dealer_count integer not null,
  snapshot_date date not null,
  created_at timestamptz not null default now(),
  unique (market, dagitici_lisans_no, snapshot_date)
);

create index if not exists distributor_network_snapshots_lookup_idx
  on distributor_network_snapshots (market, dagitici_lisans_no, snapshot_date desc);

alter table fuel_price_history enable row level security;
alter table distributor_network_snapshots enable row level security;

create policy "fuel_price_history is publicly readable"
  on fuel_price_history for select
  to anon, authenticated
  using (true);

create policy "distributor_network_snapshots is publicly readable"
  on distributor_network_snapshots for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies: only service_role (the snapshot
-- crons) can write, since it bypasses RLS by design.
