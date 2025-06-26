from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx, os, asyncio, json

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def health():
    return {"status":"ok"}

@app.post("/api/chat")
async def chat(payload: dict):
    text = payload.get("text","")
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {MISTRAL_API_KEY}"},
            json={"model":"mistral-small","messages":[{"role":"user","content":text}]}
        )
    r.raise_for_status()
    answer = r.json()["choices"][0]["message"]["content"]
    return {"answer": answer}

# --- Streaming endpoint ---
@app.post("/api/chat-stream")
async def chat_stream(payload: dict):
    text = payload.get("text","")
    async def event_generator():
        # call mistral with stream=true (pseudo, chunk 3s)
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                "https://api.mistral.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {MISTRAL_API_KEY}"},
                json={"model":"mistral-small","messages":[{"role":"user","content":text}],"stream":True},
            ) as resp:
                async for chunk in resp.aiter_text():
                    yield f"data:{chunk}\n\n"
        yield "event:done\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
