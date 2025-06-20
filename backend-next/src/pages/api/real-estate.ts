import type { NextApiRequest, NextApiResponse } from 'next'
const mockData = [
  {
    id: '1',
    title: 'Energy Warehouse - Istanbul',
    location: 'Istanbul / Esenler',
    area: '1500 m²',
    price: '₺5,000,000',
    description:
      'Large warehouse close to main highways, suitable for storage of fuels and equipment.',
    contact: 'contact@energyrealestate.com',
    image: 'https://picsum.photos/id/1018/600/400', // warehouse placeholder
  },
  {
    id: '2',
    title: 'Fuel Depot Plot - Ankara',
    location: 'Ankara / Yenimahalle',
    area: '3000 m²',
    price: '₺12,000,000',
    description:
      'Open land plot zoned for fuel depot with easy access to transport routes.',
    contact: 'sales@energyrealestate.com',
    image: 'https://picsum.photos/id/1015/600/400', // open land placeholder
  },
  {
    id: '3',
    title: 'Office Building - Izmir',
    location: 'Izmir / Konak',
    area: '800 m²',
    price: '₺8,500,000',
    description:
      'Modern office building located in the city center, ideal for energy sector companies.',
    contact: 'office@energyrealestate.com',
    image: 'https://picsum.photos/id/1027/600/400', // office building placeholder
  },
  {
    id: '4',
    title: 'Storage Facility - Bursa',
    location: 'Bursa / Nilüfer',
    area: '1200 m²',
    price: '₺4,200,000',
    description:
      'Secure storage facility with 24/7 surveillance and easy highway access.',
    contact: 'storage@energyrealestate.com',
    image: 'https://picsum.photos/id/1033/600/400', // storage facility placeholder
  },
  {
    id: '5',
    title: 'Industrial Land - Gaziantep',
    location: 'Gaziantep / Şahinbey',
    area: '5000 m²',
    price: '₺15,000,000',
    description:
      'Spacious industrial land suitable for constructing energy production units.',
    contact: 'land@energyrealestate.com',
    image: 'https://picsum.photos/id/1040/600/400', // industrial land placeholder
  },
  {
    id: '6',
    title: 'Fuel Station Location - Antalya',
    location: 'Antalya / Muratpaşa',
    area: '950 m²',
    price: '₺6,000,000',
    description:
      'Prime location for a fuel station with high traffic and visibility.',
    contact: 'fuelstation@energyrealestate.com',
    image: 'https://picsum.photos/id/1050/600/400', // fuel station placeholder
  },
  {
    id: '7',
    title: 'Refinery Office Complex - Kocaeli',
    location: 'Kocaeli / İzmit',
    area: '2000 m²',
    price: '₺20,000,000',
    description:
      'Office complex adjacent to refinery facilities with ample parking and amenities.',
    contact: 'refinery@energyrealestate.com',
    image: 'https://picsum.photos/id/1060/600/400', // refinery office placeholder
  },
  {
    id: '8',
    title: 'Logistics Hub - Samsun',
    location: 'Samsun / Atakum',
    area: '3500 m²',
    price: '₺9,500,000',
    description:
      'Strategically located logistics hub for energy distribution across northern regions.',
    contact: 'logistics@energyrealestate.com',
    image: 'https://picsum.photos/id/1070/600/400', // logistics hub placeholder
  },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow CORS from localhost:5173 (your frontend origin)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle OPTIONS method for preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Send the actual JSON response
  res.status(200).json(mockData)
}
