import React, { useState, useEffect, useRef } from 'react';
import './theme.css';

const BOT_NAME = 'Chat IA';
const API_URL = 'https://chatinn-api.onrender.com/api/chat';   // endpoint non-stream

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uCount, setUCount] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '' });
  const endRef = useRef(null);

  /* --- scroll auto --- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* --- envoi --- */
  async function send(e) {
    e.preventDefault();
    const txt = input.trim();
    if (!txt) return;
    setInput('');
    setMessages(m => [...m, { from: 'user', text: txt }, { from: 'bot', text: '' }]);
    setLoading(true);
    setUCount(c => c + 1);

    try {
      const rsp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: txt })
      });
      const data = await rsp.json();                 // { text: "…" }
      setMessages(m => {
        const arr = [...m];
        arr[arr.length - 1].text = data.text;
        return arr;
      });
    } catch (_) {
      setMessages(m => {
        const arr = [...m];
        arr[arr.length - 1].text = 'Erreur serveur.';
        return arr;
      });
    } finally {
      setLoading(false);
    }
  }

  /* --- lead form après 3 messages --- */
  useEffect(() => {
    if (uCount >= 3 && !showLead) setShowLead(true);
  }, [uCount, showLead]);

  return (
    <div className="chatinn-floating">
      <div className="chat-widget">

        <div className="chat-header">
          <span role="img" aria-label="logo">💬</span> {BOT_NAME}
        </div>

        <div className="chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.from}`}>
              {m.text || <span className="spinner" />}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {showLead && (
          <form className="lead-form" onSubmit={e => { e.preventDefault(); setShowLead(false); }}>
            <input placeholder="Nom" value={lead.name}
                   onChange={e => setLead({ ...lead, name: e.target.value })} />
            <input placeholder="Email" required value={lead.email}
                   onChange={e => setLead({ ...lead, email: e.target.value })} />
            <button>Envoyer</button>
          </form>
        )}

        <form className="input-bar" onSubmit={send}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Votre message"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(e); }}
          />
          <button disabled={loading}>Envoyer</button>
        </form>

      </div>
    </div>
  );
}

