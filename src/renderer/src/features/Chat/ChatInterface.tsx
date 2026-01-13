import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader2, Sparkles, Paperclip } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useChat } from '../../hooks/useChat'
import { cn } from '../../lib/utils'

export function ChatInterface(): React.JSX.Element {
  const {
    messages,
    sendMessage,
    isGenerating,
    modelProgress,
    modelLoading,
    activeFiles,
    addActiveFiles,
    clearActiveFiles
  } = useChat()
  const [input, setInput] = useState('')
  const [isAttaching, setIsAttaching] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (): void => {
    if (!input.trim() || isGenerating) return
    sendMessage(input)
    setInput('')
  }

  const handleAttach = async (): Promise<void> => {
    setIsAttaching(true)
    console.log('[ChatInterface] Handing attach...')
    try {
      const paths = await window.api.openFile()
      console.log('[ChatInterface] Selected paths:', paths)

      if (paths && paths.length > 0) {
        // 1. Index them for future RAG (Background)
        window.api.processDroppedFiles(paths).catch((err) => console.error('Indexing failed', err))

        // 2. Read content for IMMEDIATE context (Explicit)
        console.log('[ChatInterface] Calling readFiles...')
        const filesWithContent = await window.api.readFiles(paths)
        console.log('[ChatInterface] readFiles returned:', filesWithContent)

        if (filesWithContent.length > 0) {
          console.log('[ChatInterface] Adding to activeFiles:', filesWithContent.length)
          addActiveFiles(filesWithContent)
        } else {
          console.warn('[ChatInterface] readFiles returned empty array')
        }
      }
    } catch (err) {
      console.error('Failed to attach file:', err)
    } finally {
      setIsAttaching(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-background/50 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm">Assistant IA</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                BÊTA
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${modelLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                {modelLoading ? 'LOADING MODEL' : 'PHI-3 READY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.length === 0 && !modelLoading && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
            <Bot className="h-16 w-16 mb-4" />
            <p className="text-sm">Posez une question sur vos documents.</p>
          </div>
        )}

        {/* Loading Progress Overlay */}
        {modelLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium animate-pulse">{modelProgress}</p>
            <p className="text-xs text-muted-foreground mt-2">(Premier chargement ~2GB)</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                'flex gap-4 max-w-[85%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div
                className={cn(
                  'h-8 w-8 shrink-0 rounded-full flex items-center justify-center shadow-lg',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground shadow-primary/20'
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-black/20'
                )}
              >
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={cn(
                  'p-5 rounded-3xl text-sm leading-7 tracking-wide shadow-md transition-all duration-200',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary/90 to-indigo-600/90 text-primary-foreground rounded-tr-sm shadow-primary/10 backdrop-blur-sm'
                    : 'bg-background/60 backdrop-blur-md border border-white/5 rounded-tl-sm text-foreground/90 markdown-body'
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                  {msg.content}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 text-xs">
                    <p className="font-semibold mb-2 opacity-60 uppercase tracking-widest text-[10px]">
                      Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <button
                          key={idx}
                          onClick={() => window.api.showInFolder(source.path)}
                          className="group relative px-2.5 py-1.5 bg-background/40 hover:bg-background/60 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-200 flex items-center gap-2 overflow-hidden"
                          title={source.path}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                            📄
                          </span>
                          <span className="truncate max-w-[140px] opacity-80 group-hover:opacity-100 transition-opacity">
                            {source.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mr-auto max-w-[85%]"
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-white flex items-center justify-center shadow-lg">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="bg-background/40 border border-white/5 rounded-3xl rounded-tl-sm p-4 flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 bg-foreground/40 rounded-full animate-bounce" />
              <span className="ml-2 text-xs text-muted-foreground/50 font-medium">
                Analyse en cours...
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/80 backdrop-blur-md border-t border-white/10">
        {/* Active Files Chips */}
        {activeFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {activeFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs border border-primary/20"
              >
                <Paperclip className="h-3 w-3" />
                <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                <button
                  onClick={clearActiveFiles}
                  className="hover:text-destructive transition-colors ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-2">
          {/* Attachment Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleAttach}
            disabled={isGenerating || !!modelLoading || isAttaching}
            className="shrink-0 h-10 w-10 rounded-xl text-muted-foreground hover:text-white"
            title="Ajouter un document (PDF, Texte, Image)"
          >
            {isAttaching ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={!!modelLoading}
            placeholder={modelLoading ? 'Initialisation du modèle...' : 'Message...'}
            className="w-full bg-muted/30 border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[50px] max-h-[120px] scrollbar-hide text-sm"
            rows={1}
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg shadow-sm"
            onClick={handleSend}
            disabled={!input.trim() || isGenerating || !!modelLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-[10px] text-center text-muted-foreground/40 mt-2">
          Phi-3.5 Local • Vos données ne quittent jamais cet appareil.
        </div>
      </div>
    </div>
  )
}
