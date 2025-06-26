from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx, os

app = FastAPI()

# --- CORS : autorise le widget hébergé ailleurs ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- schéma d’entrée ---
class Msg(BaseModel):
    text: str

# --- config Mistral ---
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_KEY = os.getenv("MISTRAL_API_KEY")   # définie dans Render ➜ Environment

# --- endpoint non-stream ---
@app.post("/api/chat")
async def chat(msg: Msg):
    headers = {"Authorization": f"Bearer {MISTRAL_KEY}"}
    payload = {
        "model": "mistral-small",
        "messages": [{"role": "user", "content": msg.text}],
    }
    async with httpx.AsyncClient(timeout=60) as cli:
        r = await cli.post(MISTRAL_URL, json=payload, headers=headers)
        r.raise_for_status()
        answer = r.json()["choices"][0]["message"]["content"]
        return {"text": answer.strip()}
