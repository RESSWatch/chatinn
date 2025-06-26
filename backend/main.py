from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os, asyncio, httpx

app = FastAPI(title="ChatInn API")
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

MISTRAL_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"

@app.post("/api/chat")
async def chat(payload: dict):
    text = payload.get("text","").strip()
    if not text:
        raise HTTPException(400, "text required")
    body = {"model":"mistral-small","messages":[{"role":"user","content":text}]}
    headers = {"Authorization": f"Bearer {MISTRAL_KEY}"}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(MISTRAL_URL, json=body, headers=headers)
        r.raise_for_status()
        answer = r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(502, str(e))
    return {"answer": answer}

@app.post("/api/events")
async def events(request: Request):
    await request.body()
    return {"status":"ok"}

@app.get("/healthz")
async def health():
    return {"status":"ok","ts":datetime.utcnow().isoformat()}
