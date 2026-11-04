import { defineConfig } from 'vite';
import { portfolio } from './scripts/portfolio-plugin.js';

export default defineConfig({
  base: './',            // relative Pfade: läuft auf jedem Host und in jedem Unterordner (z. B. GitHub Pages)
  plugins: [portfolio()],
});
