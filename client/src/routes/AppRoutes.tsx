// 🔹 src/routes/AppRoutes.tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import News from '../pages/News'
import Prices from '../pages/Prices'
import License from '../pages/License'
import LicenseDetail from '../pages/LicenseDetail'
import DistributorSummary from '../pages/DistributorSummary'
import PrivacyPolicy from '../pages/PrivacyPolicy'
import CookiePolicy from '../pages/CookiePolicy'

// Stations pulls in @react-google-maps/api, the single largest dependency
// in the bundle -- lazy-loading it keeps that weight out of every other
// page's initial load.
const Stations = lazy(() => import('../pages/Stations'))

const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/news' element={<News />} />
    <Route path='/prices' element={<Prices />} />
    <Route
      path='/stations'
      element={
        <Suspense
          fallback={
            <div className='bg-gray-50 min-h-screen'>
              <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
                <div className='animate-pulse'>
                  <div className='h-7 w-56 bg-gray-200 rounded mb-8' />
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className='h-32 rounded-lg border border-gray-200 bg-white'
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <Stations />
        </Suspense>
      }
    />
    <Route path='/license' element={<License />} />
    <Route path='/license/detail' element={<LicenseDetail />} />
    <Route path='/license/distributors' element={<DistributorSummary />} />
    <Route path='/gizlilik-politikasi' element={<PrivacyPolicy />} />
    <Route path='/cerez-politikasi' element={<CookiePolicy />} />
  </Routes>
)

export default AppRoutes
