-- Backs the "Petrol/LPG Piyasası Dağıtım Şirketleri" summary table --
-- one row per distributor with real Aktif/İptal/Transfer(kazanılan)/
-- Kaybedilen dealer counts, computed from data already ingested (no
-- new EPDK calls). Aktif/İptal come from the dealers currently on the
-- books under that distributor; transfer-in/transfer-out come from
-- every distributor_changed event ever recorded, so a distributor's
-- "kaybedilen" count reflects the full history we've observed, not
-- just current state.
create or replace function distributor_movement_summary(p_market text)
returns table (
  lisans_no text,
  lisans_sahibi_unvani text,
  aktif bigint,
  iptal bigint,
  transfer_in bigint,
  transfer_out bigint
)
language sql
stable
as $$
  with active_counts as (
    select dagitim_sirketi, count(*) as aktif
    from licenses
    where market = p_market and license_type = 'bayilik' and lisans_durumu = 'ONAYLANDI'
    group by dagitim_sirketi
  ),
  iptal_counts as (
    select dagitim_sirketi, count(*) as iptal
    from licenses
    where market = p_market and license_type = 'bayilik'
      and lisans_durumu in ('IPTAL_EDILDI', 'SONLANDIRILDI', 'IADE_EDILDI', 'FAALIYETI_GECICI_DURDURULDU')
    group by dagitim_sirketi
  ),
  transfer_in_counts as (
    select (new_value ->> 'dagitim_sirketi') as dagitim_sirketi, count(*) as transfer_in
    from license_events
    where market = p_market and event_type = 'distributor_changed'
    group by (new_value ->> 'dagitim_sirketi')
  ),
  transfer_out_counts as (
    select (old_value ->> 'dagitim_sirketi') as dagitim_sirketi, count(*) as transfer_out
    from license_events
    where market = p_market and event_type = 'distributor_changed'
    group by (old_value ->> 'dagitim_sirketi')
  )
  select
    l.lisans_no,
    l.lisans_sahibi_unvani,
    coalesce(ac.aktif, 0) as aktif,
    coalesce(ic.iptal, 0) as iptal,
    coalesce(ti.transfer_in, 0) as transfer_in,
    coalesce(tou.transfer_out, 0) as transfer_out
  from licenses l
  left join active_counts ac on ac.dagitim_sirketi = l.lisans_sahibi_unvani
  left join iptal_counts ic on ic.dagitim_sirketi = l.lisans_sahibi_unvani
  left join transfer_in_counts ti on ti.dagitim_sirketi = l.lisans_sahibi_unvani
  left join transfer_out_counts tou on tou.dagitim_sirketi = l.lisans_sahibi_unvani
  where l.market = p_market and l.license_type = 'dagitici' and l.lisans_durumu = 'ONAYLANDI'
  order by coalesce(ac.aktif, 0) desc
$$;
