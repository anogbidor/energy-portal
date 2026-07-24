-- Tracks when each distributor (dagitici) license was last used to pull
-- its Bayilik (dealer/station) data. EPDK's gateway turned out to have a
-- much stricter sustained rate limit than initial testing suggested (a
-- single call could trip a 429 even ~5-10s after the previous one), so
-- Bayilik ingestion processes a small batch of distributors per
-- invocation instead of all of them in one run. Ordering by this column
-- ascending (nulls first) naturally cycles through every distributor over
-- time without needing a separate cursor/queue table.
alter table licenses add column if not exists bayilik_last_fetched_at timestamptz;

create index if not exists licenses_bayilik_last_fetched_at_idx
  on licenses (market, license_type, lisans_durumu, bayilik_last_fetched_at);
