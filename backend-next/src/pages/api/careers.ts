import type { NextApiRequest, NextApiResponse } from 'next'

const mockJobs = [
  {
    id: '1',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Remote / Istanbul',
    type: 'Full-time',
    description:
      'Build and maintain the Petrolsa web portal with modern frontend tech.',
    requirements: [
      '3+ years experience with React',
      'Strong knowledge of TypeScript',
      'Familiarity with REST and GraphQL APIs',
    ],
    applyLink:
      'mailto:hr@petrolsa.com?subject=Application%20Frontend%20Developer',
  },
  {
    id: '2',
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Ankara Office',
    type: 'Full-time',
    description: 'Develop scalable APIs and backend services.',
    requirements: [
      'Experience with Node.js and Express',
      'Database design and optimization',
      'Knowledge of security best practices',
    ],
    applyLink:
      'mailto:hr@petrolsa.com?subject=Application%20Backend%20Developer',
  },
  {
    id: '3',
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'Remote',
    type: 'Part-time',
    description:
      'Manage digital marketing campaigns and social media presence.',
    requirements: [
      'Experience with SEO and SEM',
      'Content creation skills',
      'Strong communication abilities',
    ],
    applyLink:
      'mailto:hr@petrolsa.com?subject=Application%20Marketing%20Specialist',
  },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers if needed (like in your real-estate API)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  res.status(200).json(mockJobs)
}
