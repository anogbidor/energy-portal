// 🔹 src/pages/News.tsx
import { newsData } from '../data/news'
import NewsCard from '../components/NewsCard'

export default function News() {
  return (
    <div className='p-6 max-w-5xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6'>Tüm Enerji Haberleri</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {newsData.map((news) => (
          <NewsCard
            key={`${news.title}-${news.date}`}
            title={news.title}
            date={news.date}
            category={news.category}
            excerpt={news.excerpt}
          />
        ))}
      </div>
    </div>
  )
}
