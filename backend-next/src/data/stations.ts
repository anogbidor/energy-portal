// backend/src/data/stations.ts
export interface Station {
  id: string
  name: string
  brand: string
  location: string
  city: string
  district: string
  coordinates: { lat: number; lng: number }
  openHours: string
  phone: string
  services: string[]
  fuelTypes: string[]
}

const brands = ['BP', 'Shell', 'Petrol Ofisi', 'Total', 'Opet']
const servicesList = [
  ['Self-service', 'Car Wash', 'Café'],
  ['Full-service', 'Tire Pressure', 'ATM'],
  ['LPG', 'Truck Service', 'Market'],
  ['Car Wash', 'Air Pump', 'Café'],
  ['Self-service', 'Market'],
]
const fuelTypesList = [
  ['Gasoline', 'Diesel', 'LPG'],
  ['Gasoline', 'Diesel', 'Electric'],
  ['Gasoline', 'Diesel'],
]

const districtsIstanbul = [
  'Adalar',
  'Arnavutköy',
  'Ataşehir',
  'Avcılar',
  'Bağcılar',
  'Bahçelievler',
  'Bakırköy',
  'Başakşehir',
  'Bayrampaşa',
  'Beşiktaş',
  'Beykoz',
  'Beylikdüzü',
  'Beyoğlu',
  'Büyükçekmece',
  'Çekmeköy',
  'Esenler',
  'Esenyurt',
  'Eyüpsultan',
  'Fatih',
  'Gaziosmanpaşa',
  'Güngören',
  'Kadıköy',
  'Kağıthane',
  'Kartal',
  'Küçükçekmece',
  'Maltepe',
  'Pendik',
  'Sancaktepe',
  'Sarıyer',
  'Silivri',
  'Sultanbeyli',
]

const districtsAnkara = [
  'Altındağ',
  'Ayaş',
  'Bala',
  'Çamlıdere',
  'Çankaya',
  'Elmadağ',
  'Etimesgut',
  'Evren',
  'Gölbaşı',
  'Güdül',
  'Haymana',
  'Kahramankazan',
  'Kalecik',
  'Kızılcahamam',
  'Keçiören',
  'Mamak',
  'Nallıhan',
  'Polatlı',
  'Pursaklar',
  'Sincan',
  'Şereflikoçhisar',
  'Yenimahalle',
  'Çubuk',
  'Kazan',
  'Kızılcahamam',
  'Ayaş',
  'Gölbaşı',
  'Polatlı',
  'Elmadağ',
  'Beypazarı',
]

const districtsIzmir = [
  'Aliağa',
  'Bayındır',
  'Bayraklı',
  'Bornova',
  'Buca',
  'Çeşme',
  'Çiğli',
  'Dikili',
  'Foça',
  'Gaziemir',
  'Güzelbahçe',
  'Karabağlar',
  'Karşıyaka',
  'Kemalpaşa',
  'Kınık',
  'Kiraz',
  'Konak',
  'Menderes',
  'Menemen',
  'Narlıdere',
  'Ödemiş',
  'Seferihisar',
  'Selçuk',
  'Tire',
  'Torbalı',
  'Urla',
  'Bergama',
  'Körfez',
  'Beydağ',
  'Bayındır',
]

// Generate random phone number string
const randomPhone = () =>
  `+90 ${Math.floor(200 + Math.random() * 800)} ${Math.floor(
    100 + Math.random() * 900
  )} ${Math.floor(1000 + Math.random() * 9000)}`

// Real coordinates for known gas stations in each city
function getRealCoordinates(city: string, district: string) {
  // Istanbul coordinates
  const istanbulStations = {
    Beşiktaş: { lat: 41.0425, lng: 29.0069 }, // BP Beşiktaş
    Kadıköy: { lat: 40.9929, lng: 29.0224 }, // Shell Kadıköy
    Bakırköy: { lat: 40.982, lng: 28.8579 }, // Opet Bakırköy
    Başakşehir: { lat: 41.0931, lng: 28.802 }, // Total Başakşehir
    Ataşehir: { lat: 40.9922, lng: 29.1244 }, // BP Ataşehir
    Beylikdüzü: { lat: 40.9928, lng: 28.6427 }, // Shell Beylikdüzü
    Sarıyer: { lat: 41.1676, lng: 29.061 }, // Petrol Ofisi Sarıyer
    Avcılar: { lat: 40.9793, lng: 28.7214 }, // Opet Avcılar
    Bahçelievler: { lat: 40.9977, lng: 28.8504 }, // BP Bahçelievler
    Beyoğlu: { lat: 41.0322, lng: 28.9779 }, // Shell Beyoğlu
    Fatih: { lat: 41.0157, lng: 28.9405 }, // Total Fatih
    Üsküdar: { lat: 41.0227, lng: 29.0136 }, // BP Üsküdar
    Maltepe: { lat: 40.9358, lng: 29.1551 }, // Shell Maltepe
    Pendik: { lat: 40.8775, lng: 29.2584 }, // Opet Pendik
    Kartal: { lat: 40.9033, lng: 29.1725 }, // BP Kartal
    Esenyurt: { lat: 41.0347, lng: 28.6801 }, // Shell Esenyurt
    Beykoz: { lat: 41.1358, lng: 29.0915 }, // Total Beykoz
    Çekmeköy: { lat: 41.0364, lng: 29.1813 }, // BP Çekmeköy
    Sancaktepe: { lat: 41.0024, lng: 29.2318 }, // Shell Sancaktepe
    Silivri: { lat: 41.0731, lng: 28.2464 }, // Opet Silivri
  }

  // Ankara coordinates
  const ankaraStations = {
    Çankaya: { lat: 39.9208, lng: 32.8541 }, // BP Çankaya
    Keçiören: { lat: 40.0219, lng: 32.8305 }, // Shell Keçiören
    Yenimahalle: { lat: 39.9566, lng: 32.7934 }, // Opet Yenimahalle
    Etimesgut: { lat: 39.9568, lng: 32.6674 }, // Total Etimesgut
    Sincan: { lat: 39.9544, lng: 32.572 }, // BP Sincan
    Mamak: { lat: 39.9429, lng: 32.9186 }, // Shell Mamak
    Altındağ: { lat: 39.951, lng: 32.8603 }, // Petrol Ofisi Altındağ
    Pursaklar: { lat: 40.0396, lng: 32.9029 }, // BP Pursaklar
    Gölbaşı: { lat: 39.7904, lng: 32.809 }, // Shell Gölbaşı
    Polatlı: { lat: 39.5772, lng: 32.1413 }, // Opet Polatlı
    Çubuk: { lat: 40.2386, lng: 33.0326 }, // Total Çubuk
    Kahramankazan: { lat: 40.1586, lng: 32.6336 }, // BP Kahramankazan
    Beypazarı: { lat: 40.1675, lng: 31.9211 }, // Shell Beypazarı
    Elmadağ: { lat: 39.9208, lng: 33.2308 }, // Opet Elmadağ
    Haymana: { lat: 39.4321, lng: 32.4976 }, // Total Haymana
  }

  // Izmir coordinates
  const izmirStations = {
    Bornova: { lat: 38.4622, lng: 27.2203 }, // BP Bornova
    Karşıyaka: { lat: 38.4615, lng: 27.1128 }, // Shell Karşıyaka
    Buca: { lat: 38.3934, lng: 27.1599 }, // Opet Buca
    Konak: { lat: 38.4189, lng: 27.1287 }, // Total Konak
    Bayraklı: { lat: 38.4626, lng: 27.1678 }, // BP Bayraklı
    Çiğli: { lat: 38.493, lng: 27.0675 }, // Shell Çiğli
    Gaziemir: { lat: 38.3197, lng: 27.1546 }, // Opet Gaziemir
    Karabağlar: { lat: 38.3725, lng: 27.1025 }, // Total Karabağlar
    Menemen: { lat: 38.6076, lng: 27.0694 }, // BP Menemen
    Torbalı: { lat: 38.1619, lng: 27.3628 }, // Shell Torbalı
    Bergama: { lat: 39.1209, lng: 27.1804 }, // Opet Bergama
    Çeşme: { lat: 38.3269, lng: 26.3024 }, // Total Çeşme
    Urla: { lat: 38.3222, lng: 26.7647 }, // BP Urla
    Seferihisar: { lat: 38.1975, lng: 26.8386 }, // Shell Seferihisar
    Aliağa: { lat: 38.7994, lng: 26.9728 }, // Opet Aliağa
  }

  // Try to get a real station for the district, fall back to city center with slight variation
  const cityStations =
    city === 'İstanbul'
      ? istanbulStations
      : city === 'Ankara'
      ? ankaraStations
      : izmirStations

      if (
        (cityStations as { [key: string]: { lat: number; lng: number } })[
          district
        ]
      ) {
        return (
          cityStations as { [key: string]: { lat: number; lng: number } }
        )[district]
      }
  // Fallback to city center with slight variation if district not found
  const cityCenter =
    city === 'İstanbul'
      ? { lat: 41.0082, lng: 28.9784 }
      : city === 'Ankara'
      ? { lat: 39.9334, lng: 32.8597 }
      : { lat: 38.4237, lng: 27.1428 } // Izmir

  return {
    lat: cityCenter.lat + (Math.random() * 0.05 - 0.025), // ±0.025 variation
    lng: cityCenter.lng + (Math.random() * 0.05 - 0.025),
  }
}

export const stations: Station[] = []

function createStations(city: string, districts: string[], count: number) {
  for (let i = 0; i < count; i++) {
    const district = districts[i % districts.length]
    const brand = brands[i % brands.length]
    const services = servicesList[i % servicesList.length]
    const fuelTypes = fuelTypesList[i % fuelTypesList.length]
    const coords = getRealCoordinates(city, district)
    stations.push({
      id: `${city[0]}-${i + 1}`,
      name: `${brand} - ${district}`,
      brand,
      location: `${district} Mahallesi, ${city}`,
      city,
      district,
      coordinates: coords,
      openHours: '06:00 - 23:00',
      phone: randomPhone(),
      services,
      fuelTypes,
    })
  }
}

// Create ~100 stations for each city
createStations('İstanbul', districtsIstanbul, 100)
createStations('Ankara', districtsAnkara, 100)
createStations('İzmir', districtsIzmir, 100)
