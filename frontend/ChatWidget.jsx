import React, { useState, useEffect, useRef } from 'react';
import './theme.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const endRef = useRef(null);

  // Scroll automatique
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Envoi du message
  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    // ajout du message utilisateur
    setMessages(m => [...m, { from: 'me', text }]);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text })
      });
      const { text: botText } = await resp.json();
      setMessages(m => [...m, { from: 'bot', text: botText }]);
    } catch {
      setMessages(m => [...m, { from: 'bot', text: 'Erreur serveur.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatinn-floating">
      <div className="chat-widget">
        <div className="chat-header">Chat IA</div>
        <div className="chat-body">
          {messages.map((m,i) => (
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
            placeholder="Votre message"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit">Envoyer</button>
        </form>
      </div>
    </div>
  );
}
