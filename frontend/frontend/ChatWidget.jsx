// frontend/ChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react'
import './theme.css'  // ou ton css d’origine

// on lit l’URL de l’API depuis la variable d’env
const API_URL = import.meta.env.VITE_API_URL

export default function ChatWidget() {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [uCount, setUCount]     = useState(0)
  const [showLead, setShowLead] = useState(false)
  const [lead, setLead]         = useState({ name:'', email:'' })
  const endRef = useRef(null)

  // scroll auto sur le dernier message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    const txt = input.trim()
    if (!txt) return
    setInput('')
    // on ajoute l’émission user + placeholder bot
    setMessages(m => [
      ...m, 
      { from: 'user', text: txt },
      { from: 'bot',  text: '' }
    ])
    setLoading(true)
    setUCount(c => c + 1)

    // on ouvre un EventSource SSE
    const es = new EventSource(`${API_URL}/api/chat-stream`)

    es.onmessage = evt => {
      if (evt.data === '[DONE]') {
        es.close()
        setLoading(false)
      } else {
        // chaque chunk est du JSON { choices:[{ delta:{content: "..."} }] } ou { text: "..." }
        try {
          const chunk = JSON.parse(evt.data)
          const delta = chunk.choices?.[0]?.delta?.content ?? chunk.text ?? ''
          setMessages(m => {
            const copy = [...m]
            copy[copy.length - 1].text += delta
            return copy
          })
        } catch {
          // ignore non-JSON
        }
      }
    }

    es.onerror = () => {
      es.close()
      setMessages(m => {
        const copy = [...m]
        copy[copy.length - 1].text = 'Erreur serveur.'
        return copy
      })
      setLoading(false)
    }
  }

  // show lead-form après 3 messages utilisateurs
  useEffect(() => {
    if (uCount >= 3 && !showLead) setShowLead(true)
  }, [uCount, showLead])

  return (
    <div className="chatinn-floating">
      {/* un peu de style inline pour fixer en bas-droite */}
      <style>{`
        .chatinn-floating {
          position: fixed; 
          bottom: 20px; 
          right: 20px; 
          width: 300px; 
          z-index: 9999;
        }
      `}</style>

      <div className="chat-widget">
        <div className="chat-header">💬 Chat IA</div>
        <div className="chat-body" role="log" aria-live="polite">
          {messages.map((m,i) => (
            <div key={i} className={`msg ${m.from}`}>
              {m.text || (loading && m.from === 'bot' && <span className="typing">•••</span>)}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {showLead && (
          <form className="lead-form" onSubmit={e => { e.preventDefault(); setShowLead(false) }}>
            <input 
              placeholder="Nom" 
              value={lead.name} 
              onChange={e => setLead({ ...lead, name: e.target.value })} 
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={lead.email} 
              onChange={e => setLead({ ...lead, email: e.target.value })} 
            />
            <button type="submit">Envoyer</button>
          </form>
        )}

        <form className="input-bar" onSubmit={send}>
          <input
            placeholder="Votre message"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>Envoyer</button>
        </form>
      </div>
    </div>
  )
}

