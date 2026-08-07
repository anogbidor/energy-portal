// Maps a `licenses` table row (snake_case DB columns) back to the same
// camelCase shape EPDK's own API uses, which the frontend already expects
// (client/src/hooks/useLicenses.ts) -- keeps the external API contract
// stable regardless of the underlying DB schema.
// hasTransferred flags a license that has at least one distributor_changed
// event in its history (its dagitim_sirketi/dagitici_lisans_no changed
// between two observations -- a real transfer) while lisans_durumu itself
// never left ONAYLANDI, so it still reads as plain "Yürürlükte" with no
// indication anything happened unless you open its detail page. Callers
// that don't need this distinction (a single license's own detail view,
// which already shows full history) can omit it -- it defaults to false.
export function toLicenseApiShape(
  row: Record<string, unknown>,
  hasTransferred = false
) {
  return {
    market: row.market,
    licenseType: row.license_type,
    lisansNo: row.lisans_no,
    lisansDurumu: row.lisans_durumu,
    lisansSahibiUnvani: row.lisans_sahibi_unvani,
    vergiNo: row.vergi_no,
    baslangicTarihi: row.baslangic_tarihi,
    bitisTarihi: row.bitis_tarihi,
    iptalSonaErdirmeTarihi: row.iptal_tarihi,
    iptalSonaErdimeAciklama: row.iptal_aciklama,
    il: row.il,
    ilce: row.ilce,
    adres: row.adres,
    dagiticiLisansNo: row.dagitici_lisans_no,
    dagitimSirketi: row.dagitim_sirketi,
    hasTransferred,
  }
}
