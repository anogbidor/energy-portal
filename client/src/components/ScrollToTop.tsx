import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router doesn't reset scroll position on navigation by default
// (unlike a traditional multi-page site) -- without this, clicking a
// link while scrolled down on one page lands you at that same pixel
// position on the next page, which reads as "only part of the page"
// loaded rather than a fresh page.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
