import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { envoyerMessageAssistant } from '../services/assistantService'
import { getOrganisations } from '../services/organisationService'

function AssistantChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I can help you interpret ISO/IEC 42001 requirements or your organization’s compliance status.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [organisationId, setOrganisationId] = useState('')
  const messagesEndRef = useRef(null)

  const loadOrganizations = async () => {
    try {
      const data = await getOrganisations()
      setOrganizations(data)
    } catch { /* silencieux */ }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleOpen = () => {
    const nextState = !open
    setOpen(nextState)
    if (nextState && organizations.length === 0) loadOrganizations()
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage = { role: 'user', content: input }
    const newMessages = [...messages, newMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const data = await envoyerMessageAssistant(newMessages, organisationId)
      setMessages([...newMessages, { role: 'assistant', content: data.reponse }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <motion.span
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.4, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full border border-ink pointer-events-none"
          />
        )}
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-2xl bg-accent border border-accent flex items-center justify-center shadow-[0_0_26px_rgba(56,217,194,0.35)] cursor-pointer"
        >
          {open ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C7.03 3 3 6.58 3 11c0 2.39 1.19 4.53 3.08 5.99-.1.98-.5 2.31-1.58 3.51 0 0 2.19-.29 4.06-1.7A10.6 10.6 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
                stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round"
              />
              <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[min(360px,calc(100vw-2rem))] h-[500px] bg-white border border-line shadow-xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="border-b border-line p-4">
              <p className="font-display text-ink">Compliance assistant</p>
              <select
                value={organisationId}
                onChange={(e) => setOrganisationId(e.target.value)}
                className="w-full mt-2 px-2 py-1.5 border border-line text-xs bg-paper focus:border-accent outline-none"
              >
                <option value="">Without specific context</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>Context: {org.nom}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <span className={`inline-block px-3 py-2 text-sm max-w-[85%] text-left ${
                    msg.role === 'user' ? 'bg-ink text-white' : 'bg-paper text-ink border border-line'
                  }`}>
                    {msg.content}
                  </span>
                </div>
              ))}
              {loading && (
                <p className="text-xs text-ink-soft font-mono">The assistant is thinking...</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-line flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your question..."
                className="flex-1 px-3 py-2 border border-line focus:border-accent outline-none text-sm bg-paper"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 bg-ink text-white text-sm cursor-pointer hover:bg-[#0d1729] disabled:opacity-50"
              >
                →
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AssistantChatbot