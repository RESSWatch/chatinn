
# ChatInn – Chatbot IA pour l'hôtellerie

Ce dépôt contient un **backend FastAPI** et un **widget React** minimal pour
déployer un chatbot basé sur les API de Mistral.

## Structure

```
backend/        # API FastAPI
  main.py
  requirements.txt
frontend/
  ChatWidget.jsx
  index.js
.env.example     # variables d'environnement
```

## Prérequis

* Python 3.10+
* Node 18+
* Compte **Mistral AI** (clé API)
* Compte **Railway.app** (ou Render)
* Git

## Lancement local

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Copiez .env.example -> .env puis remplissez MISTRAL_API_KEY
uvicorn main:app --reload --port 8000
```

```bash
# Frontend
cd ../frontend
npm install react react-dom
# Utilise Vite ou un bundler à votre convenance
```

## Déploiement Railway

1. Crée un nouveau projet **"Deploy from GitHub"**.
2. Ajoute les variables d'env depuis `.env`.
3. Build command : `pip install -r backend/requirements.txt`
4. Start command : `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

## Intégration sur un site WordPress

1. Dans le thème, ajoute un `<div id="chatinn-root"></div>` avant la balise `</body>`.
2. Build le widget (`npm run build`) et téléverse le bundle JS dans `/wp-content/uploads/chatinn/`.
3. Ajoute un script dans le footer qui charge ce bundle.

## Personnalisation FAQ / RAG

Utilisez un script d'ingestion (à venir) pour indexer vos PDF et pages web dans Supabase
et adapter le prompt dans `backend/main.py`.

---

_Généré automatiquement le 2025-06-24T01:29:52.841878_
