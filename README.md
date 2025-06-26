# ChatInn Pro – widget + API

* **frontend/** – React + Vite widget (streaming, lead gen, mobile‑friendly)  
* **backend/**  – FastAPI that proxies to Mistral, SSE or JSON fallback

## Local dev

```bash
# frontend
cd frontend && npm i && npm run dev
# backend
cd backend && python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Set `MISTRAL_API_KEY` in your shell or Render → Environment.