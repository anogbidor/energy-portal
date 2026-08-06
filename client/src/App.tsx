// 🔹 src/App.tsx
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import { prefetchLicenses } from './hooks/useLicenses'

function App() {
  // Warms the license cache for the default market as soon as the app
  // loads, not when the /license page happens to mount -- by the time
  // someone actually navigates there, the data is usually already in
  // hand instead of showing a loading spinner.
  useEffect(() => {
    prefetchLicenses('petrol')
  }, [])

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-grow'>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  )
}

export default App
