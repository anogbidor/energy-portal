// Maps a `licenses` table row (snake_case DB columns) back to the same
// camelCase shape EPDK's own API uses, which the frontend already expects
// (client/src/hooks/useLicenses.ts) -- keeps the external API contract
// stable regardless of the underlying DB schema.
export function toLicenseApiShape(row: Record<string, unknown>) {
  return {
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
  }
}
