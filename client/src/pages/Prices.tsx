// src/pages/Prices.tsx
import FuelPrice from '../components/FuelPrice'
import ExchangeRates from '../components/ExchangeRates'
import {
  CurrencyDollarIcon,
  BoltIcon,
  FireIcon,
  LightBulbIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline'

export default function Prices() {
  return (
    <div className=" bg-white p-4 md:p-6 max-w-auto mx-auto space-y-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Enerji Fiyatları
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          Güncel piyasa verileri ve analizler
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Primary Prices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fuel Prices Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <FireIcon className="h-5 w-5" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  Akaryakıt ve LPG Fiyatları
                </h2>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                CANLI
              </span>
            </div>
            <div className="p-4 md:p-6">
              <FuelPrice />
            </div>
            <div className="px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              ⏱️ EPDK bayi satış fiyatı bülteni, günlük olarak güncellenmektedir
            </div>
          </div>

          {/* Energy Prices Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <BoltIcon className="h-5 w-5" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  Elektrik ve Doğalgaz Fiyatları
                </h2>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                YAKINDA
              </span>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
                      <LightBulbIcon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-sm">Elektrik</h3>
                    <p className="text-xs text-gray-500 mt-1">Yakında eklenecek</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600 mb-3">
                      <FireIcon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-sm">Doğalgaz</h3>
                    <p className="text-xs text-gray-500 mt-1">Yakında eklenecek</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Data */}
        <div className="space-y-6">
          {/* Exchange Rates Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 p-4 md:p-6 border-b border-gray-200">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <CurrencyDollarIcon className="h-5 w-5" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Döviz Kurları
              </h2>
            </div>
            <div className="p-4 md:p-6">
              <ExchangeRates />
            </div>
          </div>
        </div>

        {/* Updates Section */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 p-4 md:p-6 border-b border-gray-200">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              Güncellemeler
            </h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">Yeni Özellik!</h3>
              <p className="text-sm text-blue-600 mt-1">
                Yakında elektrik ve doğalgaz fiyatlarını ekleyeceğiz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
