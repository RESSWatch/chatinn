from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx, os, asyncio, json

app = FastAPI()

# --- 1)  CORS : autorise le widget hébergé ailleurs ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2)  Modèle d’entrée -------------------------------------------------------
class Msg(BaseModel):
    text: str

# --- 3)  Config Mistral --------------------------------------------------------
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_KEY = os.getenv("MISTRAL_API_KEY")  # à définir dans Render ▸ Environment

headers = {"Authorization": f"Bearer {MISTRAL_KEY}"}

# --- 4)  ENDPOINT NON-STREAM (JSON classique) ---------------------------------
@app.post("/api/chat")
async def chat(msg: Msg):
    payload = {
        "model": "mistral-small",
        "messages": [{"role": "user", "content": msg.text}],
    }
    async with httpx.AsyncClient(timeout=60) as cli:
        r = await cli.post(MISTRAL_URL, json=payload, headers=headers)
        r.raise_for_status()
        answer = r.json()["choices"][0]["message"]["content"]
        return {"text": answer.strip()}

# --- 5)  ENDPOINT STREAM (SSE token par token) ---------------------------------
@app.post("/api/chat-stream")
async def chat_stream(msg: Msg):
    payload = {
        "model": "mistral-small",
        "stream": True,
        "messages": [{"role": "user", "content": msg.text}],
    }

    async def gen():
        async with httpx.AsyncClient(timeout=None) as cli:
            async with cli.stream("POST", MISTRAL_URL, json=payload, headers=headers) as r:
                async for raw in r.aiter_lines():
                    if not raw or raw.startswith("data: {\"done"):
                        continue
                    data = json.loads(raw.removeprefix("data: "))
                    token = data["choices"][0]["delta"].get("content", "")
                    if token:
                        yield f"data:{token}\n\n"
                    await asyncio.sleep(0)         # libère la boucle
        yield "event:done\ndata:ok\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")

