export default function PrivacyPolicy() {
  return (
    <main className='bg-gray-50 min-h-screen'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
        <h1 className='text-2xl font-semibold text-gray-900'>Gizlilik Politikası</h1>
        <p className='text-sm text-gray-500 mt-1'>Son güncelleme: Ağustos 2026</p>

        <div className='mt-8 space-y-8 text-sm text-gray-700 leading-relaxed'>
          <section>
            <h2 className='text-base font-semibold text-gray-900 mb-2'>
              Kim olduğumuz
            </h2>
            <p>
              Enerjipost, EPDK (Enerji Piyasası Düzenleme Kurumu) lisans
              hareketlerini, akaryakıt fiyatlarını ve piyasa verilerini takip
              eden bir bilgi platformudur. Sitede yayınlanan lisans, dağıtıcı
              ve bayi bilgileri EPDK'nın kamuya açık verilerinden derlenir.
            </p>
          </section>

          <section>
            <h2 className='text-base font-semibold text-gray-900 mb-2'>
              Topladığımız veriler
            </h2>
            <p>Sitede kullanıcı hesabı veya giriş sistemi bulunmamaktadır. Topladığımız veriler:</p>
            <ul className='list-disc pl-5 mt-2 space-y-1'>
              <li>
                <strong>E-posta bülten kaydı</strong> — yalnızca site
                altbilgisindeki bülten formunu dolduran ziyaretçilerin
                e-posta adresi, güncelleme göndermek amacıyla saklanır.
              </li>
              <li>
                <strong>Reklam/iş birliği formu</strong> — "Reklam Ver"
                sayfasındaki formu dolduranların ad, e-posta, şirket
                (opsiyonel) ve mesaj bilgisi, yalnızca talebinize dönüş
                yapmak amacıyla saklanır.
              </li>
              <li>
                <strong>Anonim ziyaret istatistikleri</strong> — Vercel
                Analytics ile toplanan, kimliklendirici bilgi içermeyen
                toplu sayfa görüntüleme verileri (bkz.{' '}
                <a href='/cerez-politikasi' className='text-brand-purple hover:underline'>
                  Çerez Politikası
                </a>
                ).
              </li>
              <li>
                <strong>Standart sunucu günlükleri</strong> — barındırma
                sağlayıcımız (Vercel) her web sitesinde olduğu gibi temel
                istek günlükleri (IP adresi, tarayıcı bilgisi, erişim
                zamanı) tutar; bunlar kişisel profil oluşturmak için
                kullanılmaz.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-base font-semibold text-gray-900 mb-2'>
              Verileri nasıl kullanıyoruz
            </h2>
            <p>
              E-posta adresiniz yalnızca talep ettiğiniz güncellemeleri
              göndermek için kullanılır. Verileriniz üçüncü taraflarla
              paylaşılmaz, satılmaz veya pazarlama amacıyla
              kiralanmaz.
            </p>
          </section>

          <section>
            <h2 className='text-base font-semibold text-gray-900 mb-2'>
              Verilerin saklanması
            </h2>
            <p>
              Bülten kayıtları, veritabanı sağlayıcımız Supabase üzerinde
              saklanır. Herhangi bir zamanda kaydınızın silinmesini talep
              edebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className='text-base font-semibold text-gray-900 mb-2'>
              Haklarınız
            </h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)
              kapsamında, hakkınızda tutulan verilere erişme, bunların
              düzeltilmesini veya silinmesini talep etme hakkına sahipsiniz.
            </p>
          </section>

          <section className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
            <p className='text-amber-800 text-xs'>
              Bu sayfa, sitede fiilen topladığımız verileri yansıtacak
              şekilde hazırlanmıştır ancak hukuki danışmanlık yerine
              geçmez. Tam KVKK/GDPR uyumluluğu için bir hukuk
              danışmanından görüş alınması önerilir.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
