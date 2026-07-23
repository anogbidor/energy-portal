-- Core schema for tracking EPDK license state and history.
--
-- Status values are stored as plain text, not a Postgres enum: EPDK's own
-- lisansDurumu enum already differs between endpoints (e.g. the Bayilik
-- (dealer) query rejects a request with an error that lists its valid
-- values as ONAYLANDI/SONLANDIRILDI/IPTAL_EDILDI/IADE_EDILDI/
-- FAALIYETI_GECICI_DURDURULDU -- no SURESI_DOLDU or YURURLUKTEN_KALDIRILDI,
-- which the distributor-level endpoints do use, but IADE_EDILDI which they
-- don't). A closed enum would need editing every time a new market/license
-- type surfaces a code we haven't seen. Display labels are a UI concern.

create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),

  -- which EPDK service this record came from
  market text not null,        -- 'petrol' | 'lpg' | 'dogalgaz' | 'elektrik'
  license_type text not null,  -- 'dagitici' | 'bayilik' | ...

  lisans_no text not null,
  lisans_durumu text not null,
  lisans_sahibi_unvani text,   -- company name on the license (dagitici) or
                                -- the dealer's own company name (bayilik's
                                -- `lisansSahibi`)
  vergi_no text,

  baslangic_tarihi date,
  bitis_tarihi date,
  iptal_tarihi date,
  iptal_aciklama text,

  il text,
  ilce text,
  adres text,                  -- dagitici `adres` or bayilik `tesisAdresi`

  -- bayilik (dealer/station)-only fields: which distributor this dealer
  -- currently sits under, and the contract dates with that distributor --
  -- the contract start date is the strongest live signal that a dealer
  -- recently switched distributors, without needing a historical diff.
  dagitici_lisans_no text,
  dagitim_sirketi text,
  sozlesme_baslangic_tarihi date,
  sozlesme_bitis_tarihi date,
  kategorisi text,             -- e.g. 'ISTASYONLU'
  kacakciliktan_iptal boolean,

  -- full raw API payload for this record, so fields not modeled above
  -- aren't lost and future columns can be backfilled from history
  raw jsonb not null,

  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (market, license_type, lisans_no)
);

create index if not exists licenses_market_type_idx on licenses (market, license_type);
create index if not exists licenses_dagitici_lisans_no_idx on licenses (dagitici_lisans_no);
create index if not exists licenses_il_idx on licenses (il);

-- One row per detected change, produced by diffing a fresh EPDK pull
-- against the current `licenses` row for that (market, license_type,
-- lisans_no). This is what the "market movements" / timeline view reads.
create table if not exists license_events (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references licenses (id) on delete cascade,

  market text not null,
  license_type text not null,
  lisans_no text not null,

  event_type text not null,    -- 'issued' | 'status_changed' | 'distributor_changed' | 'cancelled'
  old_value jsonb,
  new_value jsonb,
  note text,                   -- e.g. iptal_aciklama at the time of the event

  effective_at date,           -- EPDK's own date for the change, when known
  detected_at timestamptz not null default now()
);

create index if not exists license_events_lisans_no_idx on license_events (market, license_type, lisans_no);
create index if not exists license_events_detected_at_idx on license_events (detected_at desc);

-- Observability for the scheduled ingestion job.
create table if not exists ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  market text not null,
  license_type text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  records_seen integer,
  events_created integer,
  status text not null default 'running', -- 'running' | 'success' | 'error'
  error_message text
);
