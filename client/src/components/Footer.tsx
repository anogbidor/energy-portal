import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'

const siteLinks = [
  { path: '/', name: 'Anasayfa' },
  { path: '/news', name: 'Haberler' },
  { path: '/prices', name: 'Fiyatlar' },
  { path: '/stations', name: 'İstasyonlar' },
  { path: '/license', name: 'Lisanslar' },
]

const marketLinks = [
  { market: 'petrol', name: 'Petrol' },
  { market: 'lpg', name: 'LPG' },
  { market: 'dogalgaz', name: 'Doğalgaz' },
  { market: 'elektrik', name: 'Elektrik' },
]

const distributorSummaryLinks = [
  { market: 'petrol', name: 'Petrol Dağıtım Şirketleri' },
  { market: 'lpg', name: 'LPG Dağıtım Şirketleri' },
]

const legalLinks = [
  { path: '/gizlilik-politikasi', name: 'Gizlilik Politikası' },
  { path: '/cerez-politikasi', name: 'Çerez Politikası' },
]

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Bir hata oluştu')
      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  if (status === 'success') {
    return (
      <p className='text-sm text-green-400'>
        Teşekkürler! Piyasa güncellemelerini ilk elden almaya başlayacaksınız.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-2'>
      <div className='flex gap-2'>
        <input
          type='email'
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='E-posta adresiniz'
          className='min-w-0 flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold'
        />
        <button
          type='submit'
          disabled={status === 'loading'}
          className='px-4 py-2 rounded-lg text-sm font-medium bg-brand-gold text-gray-900 hover:bg-brand-gold/90 disabled:opacity-50 transition-colors whitespace-nowrap'
        >
          {status === 'loading' ? 'Katılıyor…' : 'Katıl'}
        </button>
      </div>
      {status === 'error' && (
        <p className='text-xs text-red-400'>{errorMessage}</p>
      )}
    </form>
  )
}

export default function Footer() {
  return (
    <footer className='bg-gray-950 text-gray-400 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
        <div className='flex flex-col md:flex-row md:justify-between gap-10'>
          <div className='max-w-xs'>
            <img
              src='/enerjipost-light.svg'
              alt='Enerjipost'
              className='h-6 w-auto object-contain opacity-90'
            />
            <p className='mt-3 text-sm text-gray-500'>
              EPDK lisans hareketleri, akaryakıt fiyatları ve döviz kurları için
              gerçek zamanlı takip.
            </p>

            <h3 className='text-xs font-semibold text-gray-300 uppercase tracking-wide mt-6 mb-2'>
              Bültenimiz
            </h3>
            <p className='text-sm text-gray-500 mb-3'>
              Piyasa hareketlerini ilk elden öğrenmek için e-posta listemize
              katılın.
            </p>
            <NewsletterForm />
          </div>

          <div className='flex flex-wrap gap-x-12 gap-y-6'>
            <div>
              <h3 className='text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3'>
                Piyasalar
              </h3>
              <nav className='flex flex-col gap-2 text-sm'>
                {marketLinks.map((link) => (
                  <Link
                    key={link.market}
                    to={`/license?market=${link.market}`}
                    className='hover:text-white transition-colors'
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className='text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3'>
                Dağıtıcı Özeti
              </h3>
              <nav className='flex flex-col gap-2 text-sm'>
                {distributorSummaryLinks.map((link) => (
                  <Link
                    key={link.market}
                    to={`/license/distributors?market=${link.market}`}
                    className='hover:text-white transition-colors'
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className='text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3'>
                Site
              </h3>
              <nav className='flex flex-col gap-2 text-sm'>
                {siteLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className='hover:text-white transition-colors'
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className='text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3'>
                Yasal
              </h3>
              <nav className='flex flex-col gap-2 text-sm'>
                {legalLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className='hover:text-white transition-colors'
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className='mt-8 pt-6 border-t border-white/10 text-xs text-gray-500'>
          © {new Date().getFullYear()} Enerjipost — EPDK lisans ve piyasa verileri.
        </div>
      </div>
    </footer>
  )
}
