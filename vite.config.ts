import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: mode === 'development',
    cssCodeSplit: true
  },
  // Optimize dependencies for better performance
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'recharts',
      'react-hook-form',
      'zod',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      '@microsoft/clarity' // Exclude from pre-bundling since it's loaded dynamically
    ]
  },
}));
