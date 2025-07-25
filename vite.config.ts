/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true, // Allows using describe, test, it without explicit imports
    environment: 'jsdom', // Simulates browser DOM
    setupFiles: ['./src/setupTests.ts'], // Path to your test setup file
  },
});