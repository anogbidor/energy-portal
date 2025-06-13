// 🔹 src/components/NewsCard.tsx
type NewsProps = { title: string; date: string; category: string, excerpt: string }
export default function NewsCard({ title, date }: NewsProps) {
  return (
    <div className='bg-white border p-4 rounded shadow'>
      <h4 className='font-semibold'>{title}</h4>
      <p className='text-sm text-gray-500'>{date}</p>
    </div>
  )
}
