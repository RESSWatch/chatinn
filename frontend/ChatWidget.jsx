import React, { useState, useRef, useEffect } from 'react'
import './theme.css'

// Nom du bot
const BOT_NAME = 'Chat IA'
// URL de ton API streaming (à définir en .env ou sur Render)
const API_URL_STREAM = import.meta.env.VITE_API_URL + '/api/chat-stream'

export default function ChatWidget() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uCount, setUCount] = useState(0)
  const [showLead, setShowLead] = useState(false)
  const [lead, setLead] = useState({ name: '', email: '' })
  const endRef = useRef(null)

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    const txt = input.trim()
    if (!txt) return

    // Ajoute les bulles user + bot vide
    setInput('')
    setMessages(m => [...m, { from: 'user', text: txt }, { from: 'bot', text: '' }])
    setLoading(true)
    setUCount(c => c + 1)

    // Démarre le SSE
    const eventSrc = new EventSource(API_URL_STREAM)

    eventSrc.onmessage = e => {
      if (e.data === '[DONE]') {
        eventSrc.close()
        setLoading(false)
        return
      }
      try {
        const parsed = JSON.parse(e.data)
        const delta = parsed.choices[0].delta.content || ''
        // Injecte le delta dans la dernière bulle bot
        setMessages(m => {
          const arr = [...m]
          arr[arr.length - 1].text += delta
          return arr
        })
      } catch {
        // ignore
      }
    }

    eventSrc.onerror = () => {
      // En cas d’erreur SSE
      setMessages(m => {
        const arr = [...m]
        arr[arr.length - 1].text = 'Erreur serveur.'
        return arr
      })
      eventSrc.close()
      setLoading(false)
    }
  }

  // Affiche le formulaire lead après 3 messages utilisateurs
  useEffect(() => {
    if (uCount >= 3 && !showLead) setShowLead(true)
  }, [uCount, showLead])

  return (
    <div className="chatinn-floating">
      <div className="chat-widget">
        <div className="chat-header">
          <span role="img" aria-label="logo">💬</span> {BOT_NAME}
        </div>

        <div className="chat-body" role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.from}`}>
              {m.text || (loading && m.from === 'bot' ? <span className="typing">•••</span> : null)}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {showLead && (
          <form className="lead-form" onSubmit={e => { e.preventDefault(); setShowLead(false) }}>
            <input
              type="text"
              placeholder="Nom"
              value={lead.name}
              required
              onChange={e => setLead({ ...lead, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={lead.email}
              required
              onChange={e => setLead({ ...lead, email: e.target.value })}
            />
            <button type="submit">Envoyer</button>
          </form>
        )}

        <form className="input-bar" onSubmit={send}>
          <input
            type="text"
            placeholder="Votre message"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(e) }}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>Envoyer</button>
        </form>
      </div>
    </div>
  )
}
