import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [glsl(), tailwindcss(), solid()],
  base: './',
});