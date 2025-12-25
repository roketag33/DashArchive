import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useChat } from '../../hooks/useChat'
import { cn } from '../../lib/utils'

export function ChatInterface(): React.JSX.Element {
  const { messages, sendMessage, isLoading, progress } = useChat()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (): void => {
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
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
            <h2 className="font-semibold text-sm">Assistant IA</h2>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${progress ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                {progress ? 'LOADING MODEL' : 'PHI-3 READY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.length === 0 && !progress && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
            <Bot className="h-16 w-16 mb-4" />
            <p className="text-sm">Posez une question sur vos documents.</p>
          </div>
        )}

        {/* Loading Progress Overlay */}
        {progress && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium animate-pulse">{progress}</p>
            <p className="text-xs text-muted-foreground mt-2">(Premier chargement ~2GB)</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-4 max-w-[85%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div
                className={cn(
                  'h-8 w-8 shrink-0 rounded-full flex items-center justify-center shadow-md',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={cn(
                  'p-4 rounded-2xl text-sm leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted/50 border border-white/5 rounded-tl-none markdown-body' // Could optimize markdown rendering here
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-4 mr-auto max-w-[85%]">
            <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-muted/30 border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/80 backdrop-blur-md border-t border-white/10">
        <div className="relative flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={!!progress}
            placeholder={progress ? 'Initialisation du modèle...' : 'Message...'}
            className="w-full bg-muted/30 border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[50px] max-h-[120px] scrollbar-hide text-sm"
            rows={1}
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg shadow-sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !!progress}
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
