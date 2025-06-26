@@
-from fastapi import FastAPI
+from fastapi import FastAPI
 from pydantic import BaseModel
 from fastapi.middleware.cors import CORSMiddleware
 import httpx, os
+from fastapi.responses import StreamingResponse
+import asyncio, json
@@
 @app.post("/api/chat")
 async def chat(msg: Msg):
@@
     return {"text": answer.strip()}
+
+# ---------- STREAMING ----------
+@app.post("/api/chat-stream")
+async def chat_stream(msg: Msg):
+    """
+    Renvoie un flux SSE : chaque chunk est un morceau de la réponse Mistral.
+    Front = EventSource.
+    """
+    headers = {"Authorization": f"Bearer {MISTRAL_KEY}"}
+    payload = {
+        "model": "mistral-small",
+        "stream": True,                       # ← important
+        "messages": [{"role": "user", "content": msg.text}],
+    }
+
+    async def gen():
+        async with httpx.AsyncClient(timeout=None) as cli:
+            async with cli.stream("POST", MISTRAL_URL, json=payload, headers=headers) as r:
+                async for line in r.aiter_lines():
+                    if not line or line.startswith("data: {\"done"):
+                        continue
+                    # chaque ligne = 'data: {...}'
+                    data = json.loads(line.removeprefix("data: "))
+                    token = data["choices"][0]["delta"].get("content", "")
+                    if token:
+                        yield f"data:{token}\n\n"
+                    await asyncio.sleep(0)     # laisse respirer l’event-loop
+        yield "event:done\ndata:ok\n\n"
+
+    return StreamingResponse(gen(), media_type="text/event-stream")
