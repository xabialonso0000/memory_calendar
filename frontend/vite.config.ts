import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-quill', 'quill'],
    entries: ['src/**/*.tsx'],
  },
  server: {
    host: true, // This makes the server accessible externally
    watch: {
      usePolling: true, // Needed for Docker environments
    },
  },
})
