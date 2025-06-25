from fastapi import FastAPI, Request
from datetime import datetime
import asyncio, json, os

app = FastAPI()
EVENTS_FILE = os.getenv("EVENTS_FILE", "events.log")
_lock = asyncio.Lock()

@app.post("/api/chat")
async def chat_endpoint(payload: dict):
    """Dummy chat endpoint – replace with Mistral integration as in your existing code."""
    messages = payload.get("messages", [])
    answer = "Réponse factice – intégrer avec Mistral API."
    return {"answer": answer}

@app.post("/api/events")
async def collect_events(request: Request):
    """Stocke chaque événement Analytics en JSON Lines, horodaté en UTC."""
    raw = await request.body()
    try:
        evt = json.loads(raw)
    except ValueError:
        return {"status": "bad json"}
    evt["iso_ts"] = datetime.utcnow().isoformat()
    async with _lock:
        with open(EVENTS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(evt, ensure_ascii=False) + "\n")
    return {"status": "ok"}