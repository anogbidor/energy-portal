// 🔹 src/components/NewsCard.tsx
type NewsProps = {
  title: string
  date: string
  category: string
  excerpt: string
}

export default function NewsCard({
  title,
  date,
  category,
  excerpt,
}: NewsProps) {
  return (
    <div className='bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group'>
      <h4 className='font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2'>
        {title}
      </h4>
      <div className='flex items-center mt-2 mb-3'>
        <p className='text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
          {category}
        </p>
        <span className='mx-2 text-gray-300'>•</span>
        <p className='text-xs text-gray-400'>{date}</p>
      </div>
      <p className='text-gray-600 text-sm leading-relaxed line-clamp-3'>
        {excerpt}
      </p>
      <div className='mt-3 pt-3 border-t border-gray-100'>
        <span className='text-xs font-medium text-blue-500 hover:text-blue-600 cursor-pointer transition-colors duration-200'>
          Devamını oku →
        </span>
      </div>
    </div>
  )
}
