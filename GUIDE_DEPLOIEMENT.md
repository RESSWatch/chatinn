## Guide rapide
### Test local
```bash
# installer deps frontend
npm install
# lancer backend
docker compose up --build -d
# lancer widget
npm run dev
```
Le fichier `.env` contient déjà ta clé Mistral.
### Déploiement Render
- Crée un service web, renseigne la clé MISTRAL_API_KEY depuis `.env` (copier/coller).
- Build Command: `pip install -r backend/requirements.txt`  
- Start: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Ajoute un second service static pour `dist/` ou build via CI.
