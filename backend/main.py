from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx, os

MISTRAL_API_KEY = os.environ["MISTRAL_API_KEY"]

app = FastAPI()

# Autoriser le widget hébergé ailleurs
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_methods=["*"],
  allow_headers=["*"],
)

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    text: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # Appel à Mistral (simulé ici par un écho)
    # Remplacez par votre logique d'appel réel
    user = req.text.strip()
    if not user:
        reply = "Je n’ai pas compris votre message."
    else:
        reply = f"Vous avez dit : « {user} » — comment puis-je aider ?"
    return ChatResponse(text=reply)
