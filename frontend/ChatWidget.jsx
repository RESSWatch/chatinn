
import { useState } from "react";

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    setMessages([...newMessages, data.choices[0].message]);
  };

  return (
    <div className="fixed bottom-4 right-4 w-72 rounded-2xl shadow-lg p-4 bg-white">
      <div className="h-64 overflow-y-auto mb-2">
        {messages.map((m, i) => (
          <p key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <strong>{m.role === "user" ? "Moi" : "Bot"}:</strong> {m.content}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-grow border rounded p-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre question..."
        />
        <button className="border px-2 rounded" onClick={sendMessage}>
          Envoyer
        </button>
      </div>
    </div>
  );
}
