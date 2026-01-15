import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useChat } from '../../hooks/useChat'
import { cn } from '../../lib/utils'
import { ToolExecutionCard } from './ToolExecutionCard'

export function ChatInterface(): React.JSX.Element {
  const { messages, sendMessage, isGenerating, modelLoading } = useChat()
  const [input, setInput] = useState('')
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

  // Helper to detect if content is just raw JSON of the tool call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  const isRedundantJSON = (content: string, toolCall: any) => {
    if (!toolCall) return false
    const trimmed = content.trim()
    return trimmed.startsWith('{') && trimmed.includes(toolCall.tool)
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
              <h2 className="font-semibold text-sm">Oracle</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                V2
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${modelLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                {modelLoading ? 'LOADING MODEL' : 'CONNAISSANCE ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {/* ... empty state, error overlay, loading overlay */}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              layout
              // ... motion props
              className={cn(
                'flex gap-4 max-w-[85%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              {/* Avatar code ... */}
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
                {!isRedundantJSON(msg.content, msg.toolCall) && (
                  <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                    {msg.content}
                  </div>
                )}

                {/* Sources ... */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 text-xs">
                    {/* ... source rendering code ... */}
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

                {/* Tool Call Card */}
                {msg.toolCall && (
                  <ToolExecutionCard
                    tool={msg.toolCall.tool}
                    args={msg.toolCall.args}
                    onExecute={async () => {
                      await window.api.executeTool(msg.toolCall!.tool, msg.toolCall!.args)
                    }}
                    onRefuse={() => {
                      // TODO: Handle refusal (maybe add a system message?)
                      console.log('Refused')
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ... isGenerating indicator ... */}
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
      {/* ... Input Area ... */}
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
