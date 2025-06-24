import { useState, useEffect } from "react";
import "./theme.css";

const API_URL = "https://chatinn-api.onrender.com/api/chat";

export default function ChatWidget(){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);

  // load history
  useEffect(()=>{
    const saved = JSON.parse(localStorage.getItem("chatinn_history")||"[]");
    if(saved.length) setMessages(saved);
  },[]);
  // save history
  useEffect(()=>{
    localStorage.setItem("chatinn_history",JSON.stringify(messages));
  },[messages]);

  const send = async ()=>{
    const text=input.trim();
    if(!text) return;
    const newMsgs=[...messages,{role:"user",content:text}];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try{
      const res=await fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:newMsgs})
      });
      const data=await res.json();
      const bot=data.choices?data.choices[0].message:{role:"assistant",content:data.content||"..."};
      setMessages([...newMsgs,bot]);
    }catch(e){
      setMessages([...newMsgs,{role:"assistant",content:"Erreur: "+e.message}]);
    }finally{
      setLoading(false);
    }
  };

  return(
    <div style={{width:320,border:'1px solid #ccc',borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,.15)',background:'#fff',display:'flex',flexDirection:'column'}}>
      <div style={{background:'var(--ci-primary)',color:'#fff',padding:8,display:'flex',alignItems:'center',gap:6}}>
        <img src="/logo.png" alt="logo" style={{height:24}}/>
        <span style={{fontWeight:'bold'}}>Assistant</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:8,maxHeight:400}}>
        {messages.map((m,i)=>(
          <p key={i} style={{textAlign:m.role==='user'?'right':'left',margin:'4px 0'}}>
            <strong>{m.role==='user'?'Moi':'Bot'}:</strong> {m.content}
          </p>
        ))}
        {loading && <p style={{fontStyle:'italic',color:'#888'}}>Bot écrit…</p>}
      </div>
      <div style={{display:'flex',gap:4,padding:8}}>
        <input
          aria-label="Zone de saisie du message"
          tabIndex={0}
          style={{flex:1,border:'1px solid #ccc',borderRadius:4,padding:4}}
          placeholder="Votre message..."
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter') send();}}
        />
        <button
          aria-label="Envoyer le message"
          tabIndex={0}
          style={{background:'var(--ci-primary)',color:'#fff',border:'1px solid var(--ci-primary)',borderRadius:4,padding:'4px 8px'}}
          onClick={send}
        >Envoyer</button>
      </div>
    </div>
  );
}
