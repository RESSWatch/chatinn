
# ChatInn (Option A) – API & Widget

Cette version fixe l'environnement Python **3.11.8** et des dépendances
100 % Python pour éviter la compilation Rust sur Render :

```
fastapi 0.104.1
pydantic 1.10.15
uvicorn 0.22.0
httpx 0.27.0
```

## Déploiement Render

1. Crée un **Web Service** depuis ce dépôt.
2. Runtime : Python 3
3. **Root Directory** : `backend`
4. Build : `pip install -r requirements.txt`
5. Start : `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Variables :
   * `MISTRAL_API_KEY`
   * `MODEL_NAME=mistral-small-latest`

---
_Généré le 2025-06-24T04:30:51.884150_
