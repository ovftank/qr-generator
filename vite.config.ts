import react from "@vitejs/plugin-react";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
const __dirname = resolve(__filename, "..");
export default defineConfig({
  appType: "spa",
  base: "/",
  assetsInclude: ["**/*.xml"],
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      manifest: {
        name: "QR Generator",
        short_name: "QR Generator",
        start_url: "/",
        dir: "ltr",
        display: "standalone",
        theme_color: "#000000",
        display_override: ["standalone", "fullscreen"],
        description: "Tạo mã QR ngân hàng để thanh toán nhanh chóng và an toàn",
        lang: "vi",
        orientation: "portrait",
        icons: [
          {
            src: "icons/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
        ],
        screenshots: [
          {
            src: "icons/og-image.png",
            sizes: "1366x768",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "icons/og-image-mobile.png",
            sizes: "591x1280",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
        background_color: "#000000",
        prefer_related_applications: false,
      },
    }),
    {
      name: "create-redirects",
      apply: "build",
      closeBundle: async () => {
        const filePath = resolve(__dirname, "dist", "_redirects");
        const content = `/sitemap.xml   /sitemap.xml   200
/*             /index.html    200`;
        try {
          await writeFile(filePath, content);
        } catch (err) {
          console.error(err);
        }
      },
    },
  ],
  build: {
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "@components": resolve(__dirname, "src/components"),
      "@pages": resolve(__dirname, "src/pages"),
      "@utils": resolve(__dirname, "src/utils"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
