import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // This caused "Cannot find package"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist'
  }
});