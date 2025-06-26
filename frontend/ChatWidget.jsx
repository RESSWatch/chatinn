import React, { useState, useEffect, useRef } from 'react';
import './theme.css';

const BOT_NAME = "Chat IA";
const API_URL = "https://chatinn-api.onrender.com/api/chat";

export default function ChatWidget(){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [uCount,setUCount]=useState(0);
  const [showLead,setShowLead]=useState(false);
  const [lead,setLead]=useState({name:'',email:''});
  const endRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[messages,loading]);

  async function send(e){
    e.preventDefault();
    const txt=input.trim();
    if(!txt) return;
    setMessages(m=>[...m,{from:'user',text:txt}]);
    setInput('');
    setLoading(true);
    setUCount(c=>c+1);
    try{
      const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:txt})});
      if(!r.ok) throw new Error();
      const d=await r.json();
      setMessages(m=>[...m,{from:'bot',text:d.answer}]);
    }catch{
      setMessages(m=>[...m,{from:'bot',text:'Erreur serveur.'}]);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{if(uCount>=3 && !showLead) setShowLead(true);},[uCount,showLead]);

  const saveLead=e=>{e.preventDefault();setShowLead(false);};

  return(
    <div className="chat-widget" role="dialog" aria-label="Chat IA Widget">
      <div className="chat-header"><span className="logo" role="img" aria-label="logo">💬</span><span>{BOT_NAME}</span></div>

      <div className="chat-body" role="log" aria-live="polite">
        {messages.map((m,i)=>(<div key={i} className={\`msg \${m.from}\`}>{m.text}</div>))}
        {loading && <div className="msg bot">…</div>}
        <div ref={endRef}/>
      </div>

      {showLead && (
        <form className="lead-form" onSubmit={saveLead}>
          <input placeholder="Nom" value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})}/>
          <input placeholder="Email" type="email" required value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})}/>
          <button>Envoyer</button>
        </form>
      )}

      <form className="input-bar" onSubmit={send}>
        <input value={input} onChange={e=>setInput(e.target.value)} disabled={loading} aria-label="Votre message"/>
        <button disabled={loading}>Envoyer</button>
      </form>
    </div>
  );
}