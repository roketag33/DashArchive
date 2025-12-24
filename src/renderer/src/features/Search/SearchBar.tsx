import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2, File as FileIcon } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
// import { useTranslation } from 'react-i18next'

interface SearchResult {
  id: string
  path: string
  name: string
  score: number
}

export function SearchBar(): React.JSX.Element {
  // const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return (): void => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true)
        setOpen(true)
        try {
          const res = await window.api.searchSemantic(query)
          setResults(res)
        } catch (error) {
          console.error('Search failed', error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setOpen(false)
      }
    }, 500) // Debounce 500ms

    return (): void => clearTimeout(timer)
  }, [query])

  const handleSelect = (path: string): void => {
    window.api.showInFolder(path)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Recherche intelligente... (ex: "facture rouge")'
          className="pl-9 pr-10 bg-background/50 border-border/50 focus:bg-background transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full mt-2 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden z-50 backdrop-blur-xl"
          >
            <div className="max-h-[300px] overflow-auto p-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Meilleurs résultats
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result.path)}
                  className="w-full flex items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-medium">{result.name}</div>
                    <div className="truncate text-xs text-muted-foreground opacity-70">
                      {result.path}
                    </div>
                  </div>
                  {/* Score debug */}
                  {/* <span className="text-xs text-muted-foreground">{Math.round(result.score * 100)}%</span> */}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {open && !loading && query.length > 1 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full mt-2 w-full rounded-md border border-border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg z-50"
          >
            Aucun résultat trouvé via l&apos;IA.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
