import { useState, useEffect } from 'react'



interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  applyLink: string
}

export function useCareerListings() {

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || ''
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/careers`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch career listings')
        return res.json()
      })
      .then((data) => setJobs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [API_BASE_URL])

  return { jobs, loading, error }
}
