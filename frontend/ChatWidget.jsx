import { useState, useRef, useEffect } from "react";

const API_URL_STREAM = "https://chatinn-api.onrender.com/api/chat-stream";
const BOT_NAME       = "Chat IA";

export default function ChatWidget() {
  /* --- state ------------------------------------------------------------ */
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [uCount, setUCount]     = useState(0);
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead]         = useState({ name: "", email: "" });
  const endRef                  = useRef(null);

  /* auto-scroll */
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* ---------------- SEND ----------------------------------------------- */
  async function send(e) {
    e.preventDefault();
    const txt = input.trim();
    if (!txt) return;

    /* push bulles user + bot */
    setInput("");
    setMessages(m => [...m, { from: "user", text: txt }, { from: "bot", text: "" }]);
    setLoading(true);
    setUCount(c => c + 1);

    try {
      /* fetch en mode stream */
      const rsp = await fetch(API_URL_STREAM, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ text: txt })
      });
      if (!rsp.ok) throw new Error("HTTP " + rsp.status);

      const reader = rsp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value);
          /* chaque token arrive sous forme "data:xxx\n\n" */
          chunk.split("data:").forEach(token => {
            if (!token.trim() || token.startsWith("event:")) return;
            setMessages(m => {
              const arr = [...m];
              arr[arr.length - 1].text += token.replace(/\n\n$/, "");
              return arr;
            });
          });
        }
      }
    } catch (_) {
      setMessages(m => {
        const arr = [...m];
        arr[arr.length - 1].text = "Erreur serveur.";
        return arr;
      });
    } finally {
      setLoading(false);
    }
  }

  /* après 3 messages → formulaire lead */
  useEffect(() => { if (uCount >= 3 && !showLead) setShowLead(true); }, [uCount, showLead]);

  /* ---------------- RENDER --------------------------------------------- */
  return (
    <div className="chatinn-floating">
      <div className="chat-widget">
        <div className="chat-header">
          <span role="img" aria-label="logo">💬</span> {BOT_NAME}
        </div>

        <div className="chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.from}`}>
              {m.text || <span className="typing">•••</span>}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {showLead && (
          <form className="lead-form" onSubmit={e => { e.preventDefault(); setShowLead(false); }}>
            <input placeholder="Nom"   required value={lead.name}
                   onChange={e => setLead({ ...lead, name: e.target.value })} />
            <input placeholder="Email" required value={lead.email}
                   onChange={e => setLead({ ...lead, email: e.target.value })} />
            <button>Envoyer</button>
          </form>
        )}

        <form className="input-bar" onSubmit={send}>
          <input value={input}
                 onChange={e => setInput(e.target.value)}
                 placeholder="Votre message"
                 onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) send(e); }} />
          <button disabled={loading}>Envoyer</button>
        </form>
      </div>
    </div>
  );
}


