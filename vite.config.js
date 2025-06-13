import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      injectCode: (cssCode) => `window.__styles = ${JSON.stringify(cssCode)};`,
    }),
  ],
});