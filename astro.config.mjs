// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

const port = parseInt(process.env.PORT || '8800', 10);

// https://astro.build/config
export default defineConfig({
  output: 'server',
  server: {
    port,
    host: process.env.HOST || true, // default: 0.0.0.0 for containers / tunnels
  },
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});