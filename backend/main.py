from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, httpx

app = FastAPI(title="ChatInn API")

# --- CORS, autorise tous les domaines ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # accepte n’importe quel domaine
    allow_methods=["*"],      # GET, POST, OPTIONS, etc.
    allow_headers=["*"],      # Content-Type, Authorization, …
)

MODEL = os.getenv("MODEL_NAME", "mistral-small-latest")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

class ChatRequest(BaseModel):
    messages: list[dict]

@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not MISTRAL_API_KEY:
        return {"error": "MISTRAL_API_KEY not set"}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {MISTRAL_API_KEY}"},
            json={"model": MODEL, "messages": req.messages}
        )
    resp.raise_for_status()
    return resp.json()
