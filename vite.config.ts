import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// NITRO_PRESET is injected by Vercel automatically ("vercel") when
// the TanStack Start framework preset is selected. Locally it stays
// "node-server" so `vite dev` / `vite preview` keep working normally.
const nitroPreset = (process.env["NITRO_PRESET"] ?? "node-server") as string;

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        entry: "server",
        preset: nitroPreset,
      },
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
});
