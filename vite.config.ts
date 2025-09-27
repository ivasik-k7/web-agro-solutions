import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: "./",
  plugins: [
    react(), 
    tsconfigPaths(), 
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), 
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@styles': resolve(__dirname, 'src/styles'),
      "@hooks": resolve(__dirname, 'src/hooks'),
    },
  },

  server: {
    port: 3000, // Matches CRA default port
    open: true, // Opens browser on start
    host: true, // Allows access via network (e.g., for mobile testing)
    hmr: true, // Enables hot module replacement
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild', 
  },
})
