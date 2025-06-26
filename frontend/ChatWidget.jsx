import React, {useState,useEffect,useRef} from 'react';
import './theme.css';

const BOT_NAME="Chat IA";
const API_URL_STREAM="https://chatinn-api.onrender.com/api/chat-stream";

export default function ChatWidget(){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [uCount,setUCount]=useState(0);
  const [showLead,setShowLead]=useState(false);
  const [lead,setLead]=useState({name:'',email:''});
  const endRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[messages]);

  async function send(e){
    e.preventDefault();
    const txt=input.trim();
    if(!txt)return;
    setInput('');
    setMessages(m=>[...m,{from:'user',text:txt},{from:'bot',text:''}]);
    setLoading(true);
    setUCount(c=>c+1);

    const eventSrc=new EventSource(API_URL_STREAM,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:txt})});
    eventSrc.onmessage=e=>{
      setMessages(m=>{
        const arr=[...m];
        arr[arr.length-1].text+=e.data;
        return arr;
      });
    };
    eventSrc.onerror=()=>{eventSrc.close();setLoading(false);};
    eventSrc.addEventListener('done',()=>{eventSrc.close();setLoading(false);});
  }

  useEffect(()=>{if(uCount>=3&&!showLead) setShowLead(true)},[uCount,showLead]);

  return(
    <div className="chat-widget">
      <div className="chat-header"><span role="img" aria-label="logo">💬</span>{BOT_NAME}</div>
      <div className="chat-body">
        {messages.map((m,i)=>(<div key={i} className={`msg ${m.from}`}>{m.text || <span className="spinner"/>}</div>))}
        <div ref={endRef}/>
      </div>
      {showLead&&<form className="lead-form" onSubmit={e=>{e.preventDefault();setShowLead(false);}}>
        <input placeholder="Nom" value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})}/>
        <input placeholder="Email" required value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})}/>
        <button>Envoyer</button>
      </form>}
      <form className="input-bar" onSubmit={send}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Votre message" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){send(e)}}}/>
        <button>Envoyer</button>
      </form>
    </div>
  );
}
