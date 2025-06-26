import os, json, asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

MISTRAL_KEY = os.environ.get("MISTRAL_API_KEY")
if not MISTRAL_KEY:
    raise RuntimeError("Missing MISTRAL_API_KEY environment variable")

app = FastAPI(title="ChatInn API")

# ---- CORS: autorise le widget depuis n'importe quel domaine ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    text: str

@app.get("/healthz")
async def health():
    return {"status": "ok"}

# ------------------------------------------------------------------ #
#  Endpoint streaming SSE
# ------------------------------------------------------------------ #
async def _mistral_stream(prompt: str):
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "mistral-small-latest",
        "stream": True,
        "messages": [
            {"role": "user", "content": prompt}
        ],
    }
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as resp:
            if resp.status_code != 200:
                detail = await resp.aread()
                raise HTTPException(status_code=500, detail=detail.decode()[:400])
            async for chunk in resp.aiter_bytes():
                # Mistral renvoie déjà un flux SSE ("data: ...\n\n")
                yield chunk

@app.post("/api/chat-stream")
async def chat_stream(req: ChatRequest):
    async def gen():
        async for part in _mistral_stream(req.text):
            yield part
    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # désactive le buffering proxy
        }
    )

# ------------------------------------------------------------------ #
#  Endpoint simple (non-stream) de secours
# ------------------------------------------------------------------ #
async def _mistral_completion(prompt: str) -> str:
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "mistral-small-latest",
        "stream": False,
        "messages": [
            {"role": "user", "content": prompt}
        ],
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"]

@app.post("/api/chat")
async def chat(req: ChatRequest):
    text = await _mistral_completion(req.text)
    return JSONResponse({"text": text})