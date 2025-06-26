import React, { useState, useEffect, useRef } from 'react';
import './theme.css';
import logo from './assets/logo.png';

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '' });
  const messagesEndRef = useRef(null);

  const sendEvent = (type, payload = {}) => {
    if (!sessionId) return;
    try {
      navigator.sendBeacon(
        '/api/events',
        JSON.stringify({ type, ts: Date.now(), sessionId, ...payload })
      );
    } catch (_) {}
  };

  useEffect(() => {
    let sid = localStorage.getItem('chatinn_sid');
    if (!sid) {
      sid = Math.random().toString(36).slice(2);
      localStorage.setItem('chatinn_sid', sid);
    }
    setSessionId(sid);
    sendEvent('session_start');
    return () => sendEvent('session_end');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    sendEvent('user_message', { snippet: input.trim().slice(0, 100) });
    setUserMsgCount((c) => c + 1);
    setInput('');
    setLoading(true);

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMsg.text })
      });
      const data = await r.json();
      setMessages((m) => [...m, { from: 'bot', text: data.answer }]);
      sendEvent('bot_message');
    } catch (err) {
      setMessages((m) => [...m, { from: 'bot', text: 'Erreur serveur.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userMsgCount >= 3 && !showLeadForm) setShowLeadForm(true);
  }, [userMsgCount, showLeadForm]);

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setShowLeadForm(false);
    sendEvent('lead_capture', lead);
  };

  return (
    <div className="chat-widget" aria-label="Chat IA ChatInn">
      <div className="chat-header">
        <img src={logo} alt="Logo ChatInn" className="logo" />
        <span>ChatInn AI</span>
      </div>

      <div className="chat-body" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="msg bot">…</div>}
        <div ref={messagesEndRef} />
      </div>

      {showLeadForm && (
        <form className="lead-form" onSubmit={handleLeadSubmit}>
          <input
            aria-label="Nom"
            placeholder="Nom"
            value={lead.name}
            onChange={(e) => setLead({ ...lead, name: e.target.value })}
          />
          <input
            aria-label="Email"
            placeholder="Email"
            type="email"
            required
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
          />
          <button type="submit">Envoyer</button>
        </form>
      )}

      <form className="input-bar" onSubmit={handleSubmit}>
        <input
          aria-label="Votre message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
