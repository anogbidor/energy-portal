// 🔹 src/components/NewsCard.tsx
type NewsProps = {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  imageUrl?: string;  // New optional image prop
  link?: string;      // Added link for the "Read More" functionality
};

export default function NewsCard({
  title,
  date,
  category,
  excerpt,
  imageUrl,
  link = "#", // Default fallback
}: NewsProps) {
  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group overflow-hidden'>
      {/* Image Section - Only shown if imageUrl exists */}
      {imageUrl && (
        <div className='h-40 w-full overflow-hidden'>
          <img
            src={imageUrl}
            alt={title}
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Content Section */}
      <div className='p-5'>
        <h4 className='font-semibold text-lg text-gray-800 group-hover:text-green-600 transition-colors duration-200 line-clamp-2'>
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
          <a 
            href={link} 
            target='_blank' 
            rel='noopener noreferrer'
            className='text-xs font-medium text-green-600 hover:text-blue-600 cursor-pointer transition-colors duration-200'
          >
            Devamını oku →
          </a>
        </div>
      </div>
    </div>
  );
}