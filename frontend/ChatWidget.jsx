import React, { useState } from 'react'
import './theme.css'

const API = import.meta.env.VITE_API_URL || ''

export default function ChatWidget() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  async function send(e) {
    e.preventDefault()
    if (!input.trim()) return
    setMessages(m => [...m, { from: 'user', text: input }])
    setInput('')

    try {
      const rsp = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })
      const { text } = await rsp.json()
      setMessages(m => [...m, { from: 'bot', text }])
    } catch {
      setMessages(m => [...m, { from: 'bot', text: 'Erreur serveur.' }])
    }
  }

  return (
    <div className="chat-widget">
      <div className="chat-header">Chat IA</div>
      <div className="chat-body">
        {messages.map((m,i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form className="input-bar" onSubmit={send}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Votre message"
        />
        <button>Envoyer</button>
      </form>
    </div>
  )
}