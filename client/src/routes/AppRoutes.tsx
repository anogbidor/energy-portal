// 🔹 src/routes/AppRoutes.tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import News from '../pages/News'
import Prices from '../pages/Prices'
import License from '../pages/License'
import LicenseDetail from '../pages/LicenseDetail'
import LoadingSpinner from '../components/LoadingSpinner'

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
            <div className='flex justify-center items-center py-24'>
              <LoadingSpinner />
            </div>
          }
        >
          <Stations />
        </Suspense>
      }
    />
    <Route path='/license' element={<License />} />
    <Route path='/license/detail' element={<LicenseDetail />} />
  </Routes>
)

export default AppRoutes
