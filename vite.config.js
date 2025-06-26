import { defineConfig } from 'vite';
import react       from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  // la base si tu sers depuis un sous-chemin, sinon supprime
  // base: '/',

  plugins: [
    react(),
    // Expose toutes les vars VITE_* à import.meta.env
    EnvironmentPlugin('all', { prefix: 'VITE_' }),
  ],

  // Options de build
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  // Si ton code front vit dans un sous-dossier "frontend", décommente :
  // root: 'frontend',
});
