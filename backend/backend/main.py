from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import httpx, os, asyncio

from database import get_session, engine
from models import Conversation, Message

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "demo-key")
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"
TIMEOUT = 15
RETRY = 2

app = FastAPI(title="ChatInn Enterprise API")
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(lambda c: None)

@app.post("/api/chat")
async def chat(payload: dict, session: AsyncSession = Depends(get_session)):
    user_text = payload.get("text", "").strip()
    if not user_text:
        raise HTTPException(400, detail="text is required")

    conv_id = payload.get("conversation_id")
    if conv_id:
        conv = await session.get(Conversation, conv_id)
        if conv is None:
            raise HTTPException(404, "conversation not found")
    else:
        conv = Conversation(started_at=datetime.utcnow())
        session.add(conv)
        await session.flush()

    session.add(Message(conversation_id=conv.id, role="user", content=user_text, ts=datetime.utcnow()))

    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}"}
    body = {"model": "mistral-small", "messages":[{"role":"user","content":user_text}]}
    answer = None
    for attempt in range(RETRY+1):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                r = await client.post(MISTRAL_URL, json=body, headers=headers)
            r.raise_for_status()
            answer = r.json()["choices"][0]["message"]["content"]
            break
        except Exception as e:
            if attempt==RETRY:
                raise HTTPException(502, f"LLM error: {e}")
            await asyncio.sleep(2)

    session.add(Message(conversation_id=conv.id, role="assistant", content=answer, ts=datetime.utcnow()))
    await session.commit()
    return {"conversation_id": conv.id, "answer": answer}

@app.get("/healthz")
async def health():
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/events")
async def collect_events(request: Request):
    await request.body()
    return {"status": "ok"}
