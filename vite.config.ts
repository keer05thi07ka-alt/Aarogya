import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 3000,
    host: true, // Listen on all local IPs
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: {
        preset: 'vercel'
      }
    }),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true }, // Enable in dev mode for hackathon demo
      manifest: {
        name: 'Aarogya Health',
        short_name: 'Aarogya',
        theme_color: '#ffffff',
        display: "standalone",
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063206.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}']
      }
    }),
  ],
});
