import React, { useState, useEffect, useRef } from 'react';

const BOT_NAME = 'Chat IA';
const API_URL = import.meta.env.VITE_API_URL; // ex: https://chatinn-api.onrender.com

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const endRef = useRef(null);

  // Scroll automatique en bas à chaque nouveau message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    const txt = input.trim();
    if (!txt) return;
    setInput('');
    // on affiche tout de suite la bulle user + une bulle bot vide
    setMessages(m => [...m, { from: 'user', text: txt }, { from: 'bot', text: '' }]);
    setLoading(true);

    // --- Streaming via EventSource SSE ---
    const ev = new EventSource(`${API_URL}/api/chat-stream`, {
      withCredentials: false, // si ton backend CORS permet "*"
    });

    ev.onmessage = evt => {
      // evt.data = chunk de texte du bot
      setMessages(m => {
        const arr = [...m];
        arr[arr.length - 1].text += evt.data;
        return arr;
      });
      // si le back-end envoie "[DONE]" ou ferme la connexion, on close
      if (evt.data === '[DONE]') {
        ev.close();
        setLoading(false);
      }
    };

    ev.onerror = () => {
      // En cas d’erreur SSE (timeout, URL incorrecte…)
      ev.close();
      setMessages(m => {
        const arr = [...m];
        arr[arr.length - 1].text = 'Erreur serveur.';
        return arr;
      });
      setLoading(false);
    };
  }

  return (
    <div className="chatinn-floating">
      <div className="chat-widget">
        <div className="chat-header">
          <span role="img" aria-label="logo">💬</span> {BOT_NAME}
        </div>
        <div className="chat-body" role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.from}`}>
              {m.text || (loading && m.from === 'bot' ? <span className="typing">•••</span> : '')}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form className="input-bar" onSubmit={send}>
          <input
            type="text"
            placeholder="Votre message"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? '…' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}

