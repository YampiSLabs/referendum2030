import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://referundum2030.cat",
  output: "static",
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "ca",
        locales: {
          ca: "ca-ES",
          es: "es-ES",
          en: "en-US",
          fr: "fr-FR",
          ar: "ar",
          zh: "zh-CN",
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: "ca",
    locales: ["ca", "es", "en", "fr", "ar", "zh"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
