import { useState, useEffect } from 'react'
import { getFile } from '../lib/api'
import { parseFile, type ParsedFile } from '../lib/parse'

export function useFile(id: string | null) {
  const [file, setFile] = useState<ParsedFile | null>(null)
  const [raw, setRaw] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setFile(null)
    setRaw(null)
    setLoading(true)
    setError(null)
    getFile(id)
      .then(rawContent => {
        setRaw(rawContent)
        setFile(parseFile(rawContent))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return { file, raw, loading, error }
}
