import { queryEpdkGateway } from './epdkGateway'

export type FuelPriceItem = {
  yakit: string
  fiyat: number
  olcuBirimi: string
  tarih: string
}

export function formatDateForEpdk(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${date.getFullYear()}`
}

interface BulletinResponse {
  statusCode: number
  data: { Tarih: string; Yakıt: string; 'Ölçü Birimi': string; Fiyat: number }[]
}

// The bulletin requires an exact raporTarihi and returns nothing useful for
// a date it hasn't published yet, so today is tried first and yesterday
// as a fallback in case today's bulletin isn't out yet. Shared by
// live-data.ts (serves the current bulletin) and the daily price-history
// snapshot job (persists it) so there's one place that knows how to talk
// to this EPDK service.
export async function fetchBulletin(serviceName: string): Promise<FuelPriceItem[]> {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const date of [today, yesterday]) {
    try {
      const result = await queryEpdkGateway<BulletinResponse>(serviceName, {
        raporTarihi: formatDateForEpdk(date),
      })
      if (result?.data?.length) {
        return result.data.map((row) => ({
          yakit: row['Yakıt'],
          fiyat: row.Fiyat,
          olcuBirimi: row['Ölçü Birimi'],
          tarih: row['Tarih'],
        }))
      }
    } catch {
      // try the earlier date
    }
  }
  return []
}
