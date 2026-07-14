import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

const external = ['react', 'react-dom', 'react/jsx-runtime'];
const entry = resolve(__dirname, 'src/index.ts');

export default defineConfig(({ mode }) => {
  const isCjs = mode === 'cjs';
  return {
    plugins: [react(), dts({ insertTypesEntry: true, exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'] })],
    build: {
      lib: {
        entry,
        name: 'MatrixRain',
        formats: [isCjs ? 'cjs' : 'es'],
        fileName: () => isCjs ? 'index.cjs' : 'index.es.js',
      },
      rollupOptions: {
        external,
        output: {
          exports: isCjs ? 'default' : 'named',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsx',
          },
        },
      },
      outDir: 'dist',
      emptyOutDir: !isCjs,
    },
  };
});
