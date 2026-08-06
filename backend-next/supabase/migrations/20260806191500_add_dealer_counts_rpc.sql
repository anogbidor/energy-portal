-- Backs the network-snapshot cron job. It previously ran one COUNT
-- query per distributor (~104 round trips for petrol+lpg combined),
-- taking 90s+ and blowing past cron-job.org's 30s max timeout even
-- though the job always completed successfully server-side regardless
-- of the caller giving up. A single grouped count replaces all of
-- those round trips with one query per market.
create or replace function distributor_dealer_counts(p_market text)
returns table (dagitim_sirketi text, dealer_count bigint)
language sql
stable
as $$
  select dagitim_sirketi, count(*) as dealer_count
  from licenses
  where market = p_market
    and license_type = 'bayilik'
    and lisans_durumu = 'ONAYLANDI'
    and dagitim_sirketi is not null
  group by dagitim_sirketi
$$;
