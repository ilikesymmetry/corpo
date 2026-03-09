import { useState, useEffect } from 'react'
import { getNavigation } from '../lib/api'
import type { Navigation } from '../lib/api'

export function useNavigation() {
  const [navigation, setNavigation] = useState<Navigation | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getNavigation()
      .then(setNavigation)
      .catch(e => setError(e.message))
  }, [])

  return { navigation, error }
}
