import { useState, type FormEvent } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

export default function Advertise() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/advertise-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Bir hata oluştu')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  return (
    <main className='bg-gray-50 min-h-screen'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 py-10'>
        <header className='mb-8'>
          <h1 className='text-2xl font-semibold text-gray-900'>Reklam Ver</h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Enerjipost üzerinden Türkiye enerji sektörüne ulaşın.
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white border border-gray-200 rounded-xl p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-3'>
              Kime ulaşıyoruz
            </h2>
            <p className='text-sm text-gray-600 leading-relaxed'>
              Enerjipost, EPDK lisans hareketlerini, bayi/dağıtıcı ağlarını ve
              akaryakıt fiyatlarını gerçek zamanlı takip eden bir platform.
              Ziyaretçilerimiz genel bir kitle değil — dağıtıcılar, bayiler,
              akaryakıt sektöründe karar verici konumdaki şirketler ve
              piyasayı düzenli takip eden profesyoneller. Yani niş ama yüksek
              niyetli (high-intent) bir kitleye ulaşıyorsunuz.
            </p>
            <p className='text-sm text-gray-600 leading-relaxed mt-3'>
              Platform aktif olarak büyüyor; şu an için doğrulanmış trafik
              istatistiği paylaşmıyoruz (yakında ölçüm altyapımızı devreye
              alacağız) — bunun yerine sizi doğrudan bilgilendirmeyi tercih
              ediyoruz.
            </p>

            <h2 className='text-base font-semibold text-gray-900 mb-3 mt-6'>
              Neler sunuyoruz
            </h2>
            <ul className='text-sm text-gray-600 space-y-2 list-disc pl-5'>
              <li>Anasayfa ve fiyatlar sayfasında görünürlük</li>
              <li>Haber bültenimizde sponsorlu içerik</li>
              <li>E-posta bültenimizde yer alma</li>
            </ul>
          </div>

          <div className='bg-white border border-gray-200 rounded-xl p-6'>
            {status === 'success' ? (
              <div className='flex flex-col items-center text-center py-10'>
                <CheckCircleIcon className='h-12 w-12 text-green-500 mb-3' />
                <h2 className='text-base font-semibold text-gray-900'>
                  Mesajınız alındı
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  En kısa sürede size dönüş yapacağız.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1.5'>
                    Ad Soyad
                  </label>
                  <input
                    required
                    type='text'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className='block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
                  />
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1.5'>
                    E-posta
                  </label>
                  <input
                    required
                    type='email'
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className='block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
                  />
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1.5'>
                    Şirket <span className='text-gray-300'>(opsiyonel)</span>
                  </label>
                  <input
                    type='text'
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className='block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
                  />
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1.5'>
                    Mesajınız
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className='block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple'
                  />
                </div>
                {status === 'error' && (
                  <p className='text-xs text-red-600'>{errorMessage}</p>
                )}
                <button
                  type='submit'
                  disabled={status === 'loading'}
                  className='w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-purple hover:bg-brand-purple-dark disabled:opacity-50 transition-colors'
                >
                  {status === 'loading' ? 'Gönderiliyor…' : 'Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
