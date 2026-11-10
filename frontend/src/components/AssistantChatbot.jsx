import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MessageCircle, X, Send, Sparkles, RotateCcw } from 'lucide-react'
import { envoyerMessageAssistant } from '../services/assistantService'
import { getOrganisations } from '../services/organizationService'

const GREETING = { role: 'assistant', content: 'Hello. I can help you understand ISO/IEC 27001 controls, your assessments and your compliance status.' }

const SUGGESTIONS = [
  'What evidence do I need for A.8.5 Secure authentication?',
  'Explain segregation of duties in simple terms',
  'Which controls usually fail first in an audit?',
  'How should we classify information assets?',
]

function AssistantChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState(null)
  const [organisationId, setOrganisationId] = useState('')
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && organizations === null) getOrganisations().then(setOrganizations).catch(() => setOrganizations([]))
    if (next) setTimeout(() => inputRef.current?.focus(), 150)
  }

  const send = async (text) => {
    const content = text.trim()
    if (!content || loading) return
    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const data = await envoyerMessageAssistant(next.filter((m) => !m.error), organisationId)
      setMessages([...next, { role: 'assistant', content: data.reponse }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'The assistant is not available right now. Check that the backend is running and try again.', error: true }])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const onlyGreeting = messages.length === 1

  return (
    <>
      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Close compliance assistant' : 'Open compliance assistant'}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent bg-accent text-[#07111f] shadow-[0_0_26px_rgba(56,217,194,0.35)] cursor-pointer"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Compliance assistant"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 bottom-24 z-50 flex h-[min(560px,calc(100vh-8rem))] flex-col overflow-hidden rounded-2xl border border-line bg-paper-dark shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[380px]"
          >
            <div className="border-b border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300"><Sparkles className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-semibold text-ink">Compliance assistant</p>
                    <p className="text-[11px] text-ink-soft">AI-generated answers. Verify before relying on them.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setMessages([GREETING])} disabled={onlyGreeting} aria-label="New conversation" title="New conversation"
                  className="rounded-lg p-1.5 text-ink-soft hover:text-accent disabled:opacity-40 cursor-pointer disabled:cursor-default">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              <select value={organisationId} onChange={(e) => setOrganisationId(e.target.value)} aria-label="Answer context"
                className="mt-3 w-full border border-line px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent cursor-pointer">
                <option value="">General answers (no organization data)</option>
                {(organizations || []).map((org) => <option key={org.id} value={org.id}>Use data from {org.nom}</option>)}
              </select>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === 'user' ? 'rounded-br-md bg-accent text-[#07111f]' : m.error ? 'rounded-bl-md border border-danger/30 bg-danger-soft text-danger' : 'rounded-bl-md border border-line bg-paper text-ink'
                  }`}>
                    {m.content}
                    {m.role === 'assistant' && i > 0 && !m.error && (
                      <p className="mt-2 flex items-center gap-1 border-t border-line pt-1.5 text-[10px] text-violet-300"><Sparkles className="h-3 w-3" /> AI suggestion, not a confirmed decision</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-paper px-3.5 py-3" aria-label="The assistant is typing">
                    {[0, 1, 2].map((d) => (
                      <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-ink-soft" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
                    ))}
                  </div>
                </div>
              )}
              {onlyGreeting && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] uppercase tracking-wide text-ink-soft">Try asking</p>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)} className="block w-full rounded-lg border border-line px-3 py-2 text-left text-xs text-ink-soft hover:border-accent/50 hover:text-ink cursor-pointer">
                      {s}
                    </button>
                  ))}
                  <Link to="/ai" onClick={() => setOpen(false)} className="block pt-1 text-xs text-accent hover:underline">See AI insights for your evidence and controls →</Link>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-end gap-2 border-t border-line p-3">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask a question…"
                aria-label="Your question"
                className="max-h-28 flex-1 resize-none border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
              <button type="submit" disabled={loading || !input.trim()} aria-label="Send"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-[#07111f] disabled:opacity-40 cursor-pointer disabled:cursor-default">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AssistantChatbot
