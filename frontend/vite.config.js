import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Si tu utilises une variable d'env .env à la racine de frontend :
// import dotenv from 'dotenv'
// dotenv.config()

export default defineConfig({
  // si ton index.html est à la racine de frontend :
  root: '.',
  build: {
    // le dossier de sortie (dist/) sera créé à côté de frontend/
    outDir: '../dist',
    emptyOutDir: true
  },
  plugins: [react()]
})
