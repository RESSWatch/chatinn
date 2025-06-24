import { useState } from "react";
import "./theme.css";
const API_URL="https://chatinn-api.onrender.com/api/chat";
export default function ChatWidget(){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const send=async()=>{
    if(!input.trim()) return;
    const newMsgs=[...messages,{role:"user",content:input}];
    setMessages(newMsgs);
    setInput("");
    try{
      const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:newMsgs})});
      const data=await res.json();
      const bot=data.choices?data.choices[0].message:{role:"assistant",content:data.content||"..."};
      setMessages([...newMsgs,bot]);
    }catch(e){
      setMessages([...newMsgs,{role:"assistant",content:"Erreur: "+e.message}]);
    }
  };
  return(
    <div style={{width:320,border:'1px solid #ccc',borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,.15)',display:'flex',flexDirection:'column'}}>
      <div style={{background:'var(--ci-primary)',color:'#fff',padding:8,display:'flex',alignItems:'center',gap:6}}>
        <img src="/logo.png" alt="logo" style={{height:24}}/>
        <span>Assistant</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:8}}>
        {messages.map((m,i)=>(
          <p key={i} style={{textAlign:m.role==='user'?'right':'left',margin:'4px 0'}}>
            <strong>{m.role==='user'?'Moi':'Bot'}:</strong> {m.content}
          </p>
        ))}
      </div>
      <div style={{display:'flex',gap:4,padding:8}}>
        <input style={{flex:1,border:'1px solid #ccc',borderRadius:4,padding:4}} placeholder="Votre message..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') send();}}/>
        <button style={{background:'var(--ci-primary)',color:'#fff',border:'1px solid var(--ci-primary)',borderRadius:4,padding:'4px 8px'}} onClick={send}>Envoyer</button>
      </div>
    </div>
  );
}