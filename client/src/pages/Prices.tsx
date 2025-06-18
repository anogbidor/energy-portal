// src/pages/Prices.tsx
import FuelPrice from '../components/FuelPrice'
import ExchangeRates from '../components/ExchangeRates'
import {
  CurrencyDollarIcon,
  BoltIcon,
  FireIcon,
  LightBulbIcon,
  ChartBarIcon,
  BellAlertIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/20/solid'

export default function Prices() {
  return (
    <div className=" bg-white p-4 md:p-6 max-w-auto mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Enerji ve Emtia Fiyatları
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Güncel piyasa verileri ve analizler
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-800">
            <ArrowPathIcon className="h-3 w-3" />
            SON GÜNCELLEME: {new Date().toLocaleString()}
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <BellAlertIcon className="h-3 w-3" />
            Uyarı Ayarları
          </button>
        </div>
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
                  Anlık Akaryakıt Fiyatları
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  CANLI
                </span>
                <div className="relative">
                  <select
                    title="Select City"
                    className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>Şehir Seçin</option>
                    <option>İstanbul</option>
                    <option>Ankara</option>
                    <option>İzmir</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <FuelPrice />
            </div>
            <div className="px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              ⏱️ Fiyatlar günlük olarak güncellenmektedir
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
                  Enerji Fiyatları
                </h2>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                YAKINDA
              </span>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-3 gap-4">
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
                <div className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-gray-100 text-gray-600 mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium text-sm">LPG</h3>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <CurrencyDollarIcon className="h-5 w-5" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  Döviz Kurları
                </h2>
              </div>
              <div className="relative">
                <select
                  title="Kaynak"
                  className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Kaynak: TCMB</option>
                  <option>Kaynak: Piyasa</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="p-4 md:p-6">
                <ExchangeRates />
              </div>
              <div className="px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                📈 Grafikler için tıklayın
              </div>
            </div>

            {/* Commodities Section */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 p-4 md:p-6 border-b border-gray-200">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <ChartBarIcon className="h-5 w-5" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  Emtia Fiyatları
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 text-left border-b border-gray-200">
                      <th className="pb-2 font-medium">Emtia</th>
                      <th className="pb-2 font-medium text-right">Fiyat</th>
                      <th className="pb-2 font-medium text-right">Değişim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🛢️</span>
                          <div>
                            <p className="text-sm font-medium">Brent Petrol</p>
                            <p className="text-xs text-gray-500">Varil/ABD Doları</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">---</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center text-xs text-gray-500">
                          <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                          --
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          <div>
                            <p className="text-sm font-medium">Altın</p>
                            <p className="text-xs text-gray-500">Ons/ABD Doları</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">---</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center text-xs text-gray-500">
                          <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
                          --
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌾</span>
                          <div>
                            <p className="text-sm font-medium">Buğday</p>
                            <p className="text-xs text-gray-500">Metrik Ton</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">---</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center text-xs text-gray-500">
                          <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                          --
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 text-center">
                  + Tüm emtia fiyatlarını göster
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Updates and Suggestions Section */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 p-4 md:p-6 border-b border-gray-200">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              Güncellemeler ve Öneriler
            </h2>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">Yeni Özellik!</h3>
              <p className="text-sm text-blue-600 mt-1">
                Yakında elektrik ve doğalgaz fiyatlarını ekleyeceğiz.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="text-sm font-medium">Bildirim Alın</h3>
              <p className="text-sm text-gray-600 mt-1">
                Fiyat değişikliklerinden haberdar olmak için bildirimleri açın.
              </p>
              <button className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                Bildirimleri Ayarla
              </button>
            </div>
          </div>
        </div>
      </div>
   
  )
}