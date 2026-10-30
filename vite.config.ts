import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const nitroPreset = (process.env["NITRO_PRESET"] ??
  (process.env["VERCEL"] ? "vercel" : "node-server")) as string;

export default defineConfig({
  plugins: [
    tanstackStart(),
    react(),
    tailwindcss(),
    tsConfigPaths(),
    nitro({
      preset: nitroPreset,
    }),
  ],
});
