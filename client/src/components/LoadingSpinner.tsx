// src/components/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div className='fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-70 z-50'>
      <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-900'></div>
      <p className='mt-4 text-green-900 font-medium select-none'>
        Yükleniyor...
      </p>
    </div>
  )
}
