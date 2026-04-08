import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // Keep both plugins enabled so the Make environment works as expected.
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Keep imports short and consistent across the app.
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Limit raw-asset handling to non-code files.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
