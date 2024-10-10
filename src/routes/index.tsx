import { createFileRoute } from "@tanstack/react-router";
import { LifeApp } from "@/components/LifeApp";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Life in Pixels — your life story as a 3D pixel island" },
      { name: "description", content: "Turn milestones, habits and moods into an interactive 3D pixel-art island or star constellation." },
      { property: "og:title", content: "Life in Pixels" },
      { property: "og:description", content: "Turn milestones and moods into an interactive 3D pixel-art island." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LifeApp,
});
