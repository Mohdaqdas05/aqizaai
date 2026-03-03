import { useState, useEffect } from 'react'

/**
 * Returns true when the CSS media query matches.
 * @param {string} query  e.g. '(max-width: 768px)'
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (e) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
