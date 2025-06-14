declare module 'newsapi' {
  interface TopHeadlinesParams {
    q?: string
    sources?: string
    category?: string
    language?: string
    country?: string
    pageSize?: number
    page?: number
  }

  interface EverythingParams {
    q?: string
    sources?: string
    domains?: string
    excludeDomains?: string
    from?: string
    to?: string
    language?: string
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt'
    pageSize?: number
    page?: number
  }

  interface SourcesParams {
    category?: string
    language?: string
    country?: string
  }

  interface Article {
    source: { id: string | null; name: string }
    author: string | null
    title: string
    description: string | null
    url: string
    urlToImage: string | null
    publishedAt: string
    content: string | null
  }

  interface TopHeadlinesResponse {
    status: 'ok' | 'error'
    totalResults: number
    articles: Article[]
  }

  interface EverythingResponse {
    status: 'ok' | 'error'
    totalResults: number
    articles: Article[]
  }

  interface SourcesResponse {
    status: 'ok' | 'error'
    sources: Array<{
      id: string
      name: string
      description: string
      url: string
      category: string
      language: string
      country: string
    }>
  }

  class NewsAPI {
    constructor(apiKey: string)
    v2: {
      topHeadlines(params: TopHeadlinesParams): Promise<TopHeadlinesResponse>
      everything(params: EverythingParams): Promise<EverythingResponse>
      sources(params?: SourcesParams): Promise<SourcesResponse>
    }
  }

  export default NewsAPI
}
