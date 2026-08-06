// EPDK's real license status set (see LICENSE_STATUSES in the backend's
// epdkGateway.ts, verified directly against the API's own error response).
export const STATUS_LABELS: Record<string, string> = {
  ONAYLANDI: 'Yürürlükte',
  SONLANDIRILDI: 'Sonlandırıldı',
  IPTAL_EDILDI: 'İptal Edildi',
  IADE_EDILDI: 'İade Edildi',
  FAALIYETI_GECICI_DURDURULDU: 'Faaliyeti Geçici Durduruldu',
}

// Soft badge styling, used in the detail table.
export const STATUS_BADGE_CLASS: Record<string, string> = {
  ONAYLANDI: 'bg-green-50 text-green-700',
  SONLANDIRILDI: 'bg-gray-100 text-gray-600',
  IPTAL_EDILDI: 'bg-red-50 text-red-700',
  IADE_EDILDI: 'bg-slate-100 text-slate-600',
  FAALIYETI_GECICI_DURDURULDU: 'bg-amber-50 text-amber-700',
}

// Solid-color styling for compact calendar pills, which need more
// contrast than the soft badges above at a much smaller size.
export const STATUS_PILL_CLASS: Record<string, string> = {
  IPTAL_EDILDI: 'bg-red-600 text-white hover:bg-red-700',
  SONLANDIRILDI: 'bg-gray-600 text-white hover:bg-gray-700',
  IADE_EDILDI: 'bg-slate-500 text-white hover:bg-slate-600',
  FAALIYETI_GECICI_DURDURULDU: 'bg-amber-500 text-white hover:bg-amber-600',
}
