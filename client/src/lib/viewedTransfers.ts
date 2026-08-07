// Tracks which transferred licenses this browser has already clicked
// into, so the glow on a "Transfer Edildi" row only shows until the
// first visit -- there's no user account system, so localStorage is the
// only persistence available, and that's fine here: this is a per-device
// "have I seen this" cue, not data that needs to sync anywhere.
const STORAGE_KEY = 'enerjipost:viewedTransfers'

function readViewed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function isTransferViewed(lisansNo: string): boolean {
  return readViewed().has(lisansNo)
}

export function markTransferViewed(lisansNo: string): void {
  try {
    const viewed = readViewed()
    if (viewed.has(lisansNo)) return
    viewed.add(lisansNo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...viewed]))
  } catch {
    // Private browsing / storage disabled -- the glow just won't persist
    // across visits, which is a harmless degradation.
  }
}
