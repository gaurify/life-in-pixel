export type FrameFormat = "square" | "landscape" | "story";
export const FORMATS: Record<FrameFormat, { w: number; h: number; label: string }> = {
  square: { w: 1600, h: 1600, label: "Instagram post" },
  landscape: { w: 1920, h: 1080, label: "X / Twitter" },
  story: { w: 1080, h: 1920, label: "Story" },
};

export function exportSnapshot(source: HTMLCanvasElement, opts: { format: FrameFormat; caption: string; stats: string; frameColor: string }) {
  const { w, h } = FORMATS[opts.format];
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const pad = Math.round(Math.min(w, h) * 0.05);
  const footer = Math.round(Math.min(w, h) * 0.12);
  ctx.fillStyle = opts.frameColor;
  ctx.fillRect(0, 0, w, h);
  // cover-fit the 3D view into the frame window
  const ww = w - pad * 2, wh = h - pad * 2 - footer;
  const sr = source.width / source.height, dr = ww / wh;
  let sw = source.width, sh = source.height, sx = 0, sy = 0;
  if (sr > dr) { sw = sh * dr; sx = (source.width - sw) / 2; } else { sh = sw / dr; sy = (source.height - sh) / 2; }
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(pad + 10, pad + 10, ww, wh);
  ctx.drawImage(source, sx, sy, sw, sh, pad, pad, ww, wh);
  ctx.fillStyle = "#1a1830";
  const fs = Math.round(footer * 0.32);
  ctx.font = `${fs}px Silkscreen, monospace`;
  ctx.textBaseline = "middle";
  ctx.fillText(opts.caption || "Life in Pixels", pad, h - pad - footer / 2 - fs * 0.35);
  ctx.font = `${Math.round(fs * 0.55)}px Sora, sans-serif`;
  ctx.globalAlpha = 0.7;
  ctx.fillText(opts.stats, pad, h - pad - footer / 2 + fs * 0.6);
  ctx.globalAlpha = 1;
  const a = document.createElement("a");
  a.download = `life-in-pixels-${opts.format}.png`;
  a.href = c.toDataURL("image/png");
  a.click();
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
