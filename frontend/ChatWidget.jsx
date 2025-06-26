// frontend/ChatWidget.jsx
import React, { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);         // {from:'user'|'bot', text}
  const [input, setInput]       = useState("");
  const endRef                 = useRef(null);

  // scroll automatique en bas
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    // ajoute le message utilisateur
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");

    try {
      // appel POST JSON non‐stream
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || res.statusText);
      }
      const { text: botText } = await res.json();
      setMessages((m) => [...m, { from: "bot", text: botText }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Erreur serveur." },
      ]);
    }
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-header">Chat IA</div>
      <div className="chat-body" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Écrivez votre message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
