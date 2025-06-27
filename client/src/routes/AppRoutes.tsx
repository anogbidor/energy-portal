// 🔹 src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import News from '../pages/News'
import Prices from '../pages/Prices'
import Stations from '../pages/Stations'
import License from '../pages/License'
import Careers from '../pages/Careers'
import RealEstate from '../pages/RealEstate'

const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/news' element={<News />} />
    <Route path='/prices' element={<Prices />} />
    <Route path='/stations' element={<Stations />} />
    <Route path='/license' element={<License />} />
    <Route path='/careers' element={<Careers />} />
    <Route path='/real-estate' element={<RealEstate />} />
  </Routes>
)

export default AppRoutes
 