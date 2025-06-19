import { useState, useEffect } from 'react'

interface RealEstate {
  id: string
  title: string
  location: string
  area: string
  price: string
  description: string
  contact: string
  image?: string
}

export function useRealEstateListings() {
  const [listings, setListings] = useState<RealEstate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/api/real-estate')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch real estate listings')
        return res.json()
      })
      .then((data) => setListings(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { listings, loading, error }
}
