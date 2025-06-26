import React, { useState, useRef, useEffect } from 'react'
import './theme.css'   // ou ton fichier de styles

// Ton URL d'API définie en .env (voir plus bas)
const API_URL = import.meta.env.VITE_API_URL

export default function ChatWidget() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  // Scroll automatique en bas à chaque nouveau message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    const txt = input.trim()
    if (!txt || loading) return

    // On affiche d’abord le message utilisateur
    setMessages(m => [...m, { from: 'user', text: txt }])
    setInput('')
    setLoading(true)

    try {
      const resp = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: txt }),
      })
      const { text } = await resp.json()
      // Si pas de texte, on met 'Réponse vide'
      setMessages(m => [...m, { from: 'bot', text: text || 'Réponse vide' }])
    } catch {
      setMessages(m => [...m, { from: 'bot', text: 'Erreur serveur.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-widget">
      <div className="chat-header">Chat IA</div>
      <div className="chat-body" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="msg bot">
            <span className="typing">•••</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form className="input-bar" onSubmit={send}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Écrivez votre message…"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Envoyer
        </button>
      </form>
    </div>
  )
}

