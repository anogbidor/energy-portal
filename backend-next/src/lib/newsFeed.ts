import Parser from 'rss-parser'

export type NewsItem = {
  title: string
  date: string
  category: string
  source: string
  excerpt: string
  link: string
  imageUrl: string | null
}

// Both Bloomberg HT and CNN Türk carry a plain, non-namespaced
// <image>URL</image> element per item -- not part of the base RSS spec,
// so rss-parser drops it by default unless told to keep it via
// customFields. Confirmed directly against both feeds' raw XML.
const parser = new Parser<object, { image?: string }>({
  customFields: { item: ['image'] },
})

// Neither CNN Türk nor Bloomberg HT publish an energy-specific category
// feed (checked directly) -- both only offer a general/economy feed,
// so energy items are pulled out by keyword instead.
const ENERGY_KEYWORDS = [
  'enerji',
  'petrol',
  'akaryakıt',
  'doğalgaz',
  'doğal gaz',
  'elektrik',
  'lpg',
  'benzin',
  'motorin',
  'epdk',
  'opec',
  'brent',
  'ham petrol',
  'rafineri',
  'yenilenebilir',
  'güneş enerjisi',
  'rüzgar enerjisi',
]

function isEnergyRelated(text: string): boolean {
  const lower = text.toLocaleLowerCase('tr-TR')
  return ENERGY_KEYWORDS.some((kw) => lower.includes(kw))
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchTurkishEnergyNews(
  url: string,
  source: string
): Promise<NewsItem[]> {
  const feed = await parser.parseURL(url)
  return (feed.items ?? [])
    .filter((item) =>
      isEnergyRelated(`${item.title ?? ''} ${item.contentSnippet ?? item.content ?? ''}`)
    )
    .map((item) => ({
      title: item.title ?? 'Başlıksız',
      date: item.pubDate ?? new Date().toISOString(),
      category: 'Türkiye',
      source,
      excerpt: stripHtml(item.contentSnippet ?? item.content ?? '').slice(0, 220),
      link: item.link ?? '#',
      imageUrl: item.image ?? item.enclosure?.url ?? null,
    }))
}

async function fetchOilPriceNews(): Promise<NewsItem[]> {
  const feed = await parser.parseURL('https://oilprice.com/rss.xml')
  return (feed.items ?? []).slice(0, 15).map((item) => ({
    title: item.title ?? 'Untitled',
    date: item.pubDate ?? new Date().toISOString(),
    category: 'Global Enerji',
    source: 'OilPrice.com',
    excerpt: stripHtml(item.contentSnippet ?? item.content ?? '').slice(0, 220),
    link: item.link ?? '#',
    imageUrl: null,
  }))
}

// Merges independent sources, each with its own failure mode -- one
// feed being briefly unreachable shouldn't blank the whole section, so
// failures are caught per-source and just drop that source's items
// rather than throwing.
export async function fetchAggregatedNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled([
    fetchTurkishEnergyNews('https://www.bloomberght.com/rss', 'Bloomberg HT'),
    fetchTurkishEnergyNews(
      'https://www.cnnturk.com/feed/rss/ekonomi/news',
      'CNN Türk'
    ),
    fetchOilPriceNews(),
  ])

  const items = results.flatMap((result) => {
    if (result.status === 'fulfilled') return result.value
    console.error('News source failed:', result.reason)
    return []
  })

  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
