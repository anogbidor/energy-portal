export default function CookiePolicy() {
  return (
    <main className='bg-gray-50 min-h-screen'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
        <h1 className='text-2xl font-semibold text-gray-900'>Çerez Politikası</h1>
        <p className='text-sm text-gray-500 mt-1'>Son güncelleme: Ağustos 2026</p>

        <div className='mt-8 space-y-8 text-sm text-gray-700 leading-relaxed'>
          <section className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <p className='text-green-800'>
              Bu web sitesi şu anda hiçbir izleme çerezi (tracking cookie)
              veya reklam çerezi kullanmamaktadır. Ayrıca tarayıcınızın
              yerel depolama alanını (localStorage) kişisel veri veya
              kullanım geçmişi saklamak için kullanmıyoruz.
            </p>
          </section>

          <section>
            <h2 className='text-base font-semibold text-gray-900 mb-2'>
              Barındırma sağlayıcımız
            </h2>
            <p>
              Sitemiz Vercel üzerinde barındırılmaktadır. Vercel, her web
              sitesi barındırma hizmetinde olduğu gibi temel teknik
              günlükler (istek zamanı, IP adresi gibi) tutabilir; bu,
              çerez tabanlı bir izleme değildir ve kişisel profil
              oluşturmaz.
            </p>
          </section>

          <section>
            <h2 className='text-base font-semibold text-gray-900 mb-2'>
              Bu durum değişirse
            </h2>
            <p>
              İleride site performansını ölçmek için analiz araçları
              eklersek (örneğin ziyaretçi sayısı istatistikleri), bu
              sayfa güncellenecek ve hangi çerezlerin/araçların
              kullanıldığı burada açıkça belirtilecektir.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
