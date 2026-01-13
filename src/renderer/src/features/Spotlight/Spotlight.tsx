import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Loader2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Box,
  Mic
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { voiceService } from '../../services/VoiceService'
import { Tooltip } from '../../components/ui/tooltip'

interface SearchResult {
  path: string
  score: number
  metadata?: {
    filename: string
    extension: string
    size: number
  }
}

export function Spotlight(): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize Voice Service
  useEffect(() => {
    voiceService.initialize().catch(console.error)
  }, [])

  const toggleListening = async (): Promise<void> => {
    if (isListening) {
      voiceService.stopListening()
      setIsListening(false)
    } else {
      try {
        setIsListening(true)
        await voiceService.startListening((text) => {
          setQuery((prev) => {
            // Smart append: si vide, remplace. Si plein, ajoute.
            return prev ? `${prev} ${text}` : text
          })
        })
      } catch (err) {
        console.error('Failed to start listening', err)
        setIsListening(false)
      }
    }
  }

  // Auto-focus input when mounted
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search Logic
  useEffect(() => {
    const search = async (): Promise<void> => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await (window.api as any).searchSemantic(query)
        setResults(res)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(window.api as any).showInFolder(results[selectedIndex].path)
        }
      } else if (e.key === 'Escape') {
        // Hide window via IPC (Need to add this IPC if logic requires renderer trigger,
        // but GlobalShortcut handles toggle. Esc could clear query or just do nothing)
        setQuery('')
        setResults([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [results, selectedIndex])

  const getIcon = (path: string): React.JSX.Element => {
    const ext = path.split('.').pop()?.toLowerCase()
    if (['jpg', 'png', 'webp', 'gif'].includes(ext || ''))
      return <ImageIcon className="h-5 w-5 text-purple-500" />
    if (['mp4', 'mov', 'webm'].includes(ext || ''))
      return <Video className="h-5 w-5 text-pink-500" />
    if (['mp3', 'wav', 'aac'].includes(ext || ''))
      return <Music className="h-5 w-5 text-blue-500" />
    if (['js', 'ts', 'jsx', 'tsx', 'py'].includes(ext || ''))
      return <Code className="h-5 w-5 text-green-500" />
    if (['zip', 'rar', '7z'].includes(ext || '')) return <Box className="h-5 w-5 text-orange-500" />
    return <FileText className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <div className="h-screen w-screen bg-transparent flex flex-col items-center pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-[700px] bg-background/80 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-xl overflow-hidden flex flex-col"
      >
        {/* Input Area */}
        <div className="relative h-16 flex items-center px-4 border-b border-white/10">
          <Search className="h-6 w-6 text-muted-foreground/70 mr-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-2xl font-light tracking-wide placeholder:text-muted-foreground/30 text-foreground"
            placeholder="Ask Jarvis..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          <div className="ml-2 px-2 py-0.5 rounded bg-muted/20 text-xs font-mono text-muted-foreground mr-2">
            CMD+K
          </div>
          <Tooltip content="Commande Vocale (Jarvis)" side="left">
            <button
              onClick={toggleListening}
              className={cn(
                'p-2 rounded-full transition-all duration-300 relative overflow-hidden',
                isListening
                  ? 'bg-red-500/20 text-red-500'
                  : 'hover:bg-muted/20 text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-red-500/20 rounded-full animate-ping',
                  isListening ? 'opacity-100' : 'opacity-0'
                )}
              />
              <Mic className={cn('h-5 w-5 relative z-10', isListening && 'animate-pulse')} />
            </button>
          </Tooltip>
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="max-h-[400px] overflow-y-auto p-2"
            >
              {results.map((result, index) => (
                <div
                  key={result.path}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-default',
                    index === selectedIndex ? 'bg-primary/20' : 'hover:bg-muted/30'
                  )}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ;(window.api as any).showInFolder(result.path)
                  }}
                >
                  <div className="p-2 rounded-md bg-background/50 border border-white/10">
                    {getIcon(result.path)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-lg leading-none mb-1 truncate text-foreground/90">
                      {result.metadata?.filename || result.path.split('/').pop()}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate opacity-70">
                      {result.path}
                    </p>
                  </div>
                  {index === selectedIndex && (
                    <span className="text-xs text-muted-foreground font-mono">↩︎</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="h-8 bg-muted/10 flex items-center justify-between px-4 text-[10px] text-muted-foreground border-t border-white/5">
          <div className="flex gap-3">
            <span>
              Core: <span className="text-green-400">Online</span>
            </span>
            <span>
              Neural: <span className="text-purple-400">Active</span>
            </span>
          </div>
          <div>DashArchive v1.2</div>
        </div>
      </motion.div>
    </div>
  )
}
