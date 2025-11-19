import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const nodeEnv = process.env.NODE_ENV ?? 'development';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(nodeEnv)
  },
  build: {
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'RumorWebchatWidget',
      fileName: (format) => `rumor-webchat-widget.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        exports: 'named'
      }
    }
  }
});
