# Project guidance

- Keep the Life in Pixels visual identity consistent with the existing pixel-art experience.
- Prefer small, focused changes and reuse existing components and hooks.
- Keep TypeScript types explicit and avoid introducing `any` unless necessary.
- Routes are file-based in `src/routes/`; do not edit the generated `src/routeTree.gen.ts` by hand.
- Run `npm run lint` and `npm run build` after significant changes.
- Do not commit secrets, API keys, or local environment files.
