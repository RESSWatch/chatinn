import {defineConfig} from 'vite';import react from '@vitejs/plugin-react',root:'frontend',build:{outDir:'../dist',emptyOutDir:true}});
import EnvironmentPlugin from 'vite-plugin-environment'
export default defineConfig({
  plugins: [
    react(),
    // expose toutes les VITE_* à import.meta.env
    EnvironmentPlugin('all', { prefix: 'VITE_' }),
  ],
})
