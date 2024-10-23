import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Download, Mountain, Pencil, Plus, Sparkles, Trash2, Upload, X } from "lucide-react";
import { World } from "./World";
import { EntryDrawer } from "./EntryDrawer";
import { Timeline } from "./Timeline";
import { useLifeStore, parseBackup } from "@/hooks/useLifeStore";
import type { Milestone, ViewMode } from "@/types/life";
import { CATEGORY_GLYPH, MOOD_COLORS } from "@/utils/palette";
import { downloadJSON, exportSnapshot, FORMATS, type FrameFormat } from "@/utils/snapshot";

export function LifeApp() {
  const store = useLifeStore();
  const { milestones } = store;
  const [mode, setMode] = useState<ViewMode>("island");
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ open: boolean; editing: Milestone | null }>({ open: false, editing: null });
  const [snapOpen, setSnapOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!playing) setCount(milestones.length); }, [milestones.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c >= milestones.length) { setPlaying(false); return c; }
        return c + 1;
      });
    }, 700);
    return () => clearInterval(t);
  }, [playing, milestones.length]);

  const selected = milestones.find((m) => m.id === selectedId) ?? null;

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (count >= milestones.length) setCount(0);
    setSelectedId(null);
    setPlaying(true);
  };

  const onImport = async (f: File) => {
    try { store.replaceAll(parseBackup(await f.text())); }
    catch { alert("That file doesn't look like a Life in Pixels backup."); }
  };

  const years = milestones.length ? `${milestones[0].date.slice(0, 4)}–${milestones[milestones.length - 1].date.slice(0, 4)}` : "";

  return (
    <div ref={wrapRef} className="fixed inset-0">
      <Canvas shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true, antialias: false }}
        camera={{ position: [14, 13, 16], fov: 45 }}>
        <Suspense fallback={null}>
          <World milestones={milestones} visibleCount={count} mode={mode} selectedId={selectedId} onSelect={setSelectedId} />
        </Suspense>
      </Canvas>

      {/* Header */}
      <header className="pointer-events-none fixed inset-x-3 top-3 z-20 flex flex-wrap items-start justify-between gap-2">
        <div className="glass pointer-events-auto px-4 py-2.5">
          <h1 className="font-pixel text-base leading-none">Life in Pixels</h1>
          <p className="mt-1 text-[11px] text-muted-foreground">{milestones.length} memories {years && `· ${years}`}</p>
        </div>
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <div className="glass flex p-0.5">
            {(["island", "constellation"] as const).map((v) => (
              <button key={v} onClick={() => setMode(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-pixel text-[10px] ${mode === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {v === "island" ? <Mountain size={12} /> : <Sparkles size={12} />}{v === "island" ? "Island" : "Stars"}
              </button>
            ))}
          </div>
          <button className="pixel-btn" onClick={() => setSnapOpen(true)} disabled={!milestones.length}><Camera size={14} /><span className="hidden md:inline">Snapshot</span></button>
          <button className="pixel-btn" onClick={() => downloadJSON({ version: 1, exportedAt: new Date().toISOString(), milestones }, "life-in-pixels-backup.json")}><Download size={14} /><span className="hidden md:inline">Backup</span></button>
          <button className="pixel-btn" onClick={() => fileRef.current?.click()}><Upload size={14} /><span className="hidden md:inline">Import</span></button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ""; }} />
          <button className="pixel-btn pixel-btn-primary" onClick={() => setDrawer({ open: true, editing: null })}><Plus size={14} />Add</button>
        </div>
      </header>

      {/* Selected detail */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="glass fixed bottom-24 left-3 z-20 w-[min(320px,calc(100vw-1.5rem))] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-pixel text-[10px] text-muted-foreground">{CATEGORY_GLYPH[selected.category]} {selected.category} · {selected.date}</div>
                <h3 className="mt-1 font-semibold">{selected.title}</h3>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close" className="text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="h-3 w-3" style={{ background: MOOD_COLORS[selected.mood] }} />{selected.mood}
              <span className="text-muted-foreground">· {"■".repeat(selected.significance)}{"□".repeat(5 - selected.significance)}</span>
            </div>
            {selected.note && <p className="mt-2 text-sm text-muted-foreground">{selected.note}</p>}
            {selected.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">{selected.tags.map((t) => <span key={t} className="border px-1.5 py-0.5 text-[10px]">#{t}</span>)}</div>
            )}
            <div className="mt-3 flex gap-2">
              <button className="pixel-btn" onClick={() => setDrawer({ open: true, editing: selected })}><Pencil size={12} />Edit</button>
              <button className="pixel-btn" onClick={() => { store.remove(selected.id); setSelectedId(null); }}><Trash2 size={12} />Delete</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* First-visit welcome */}
      <AnimatePresence>
        {store.loaded && store.firstVisit && milestones.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center p-4">
            <div className="glass max-w-md p-6 text-center">
              <h2 className="font-pixel text-xl">Your life, in pixels</h2>
              <p className="mt-3 text-sm text-muted-foreground">Every milestone grows something on your island — towers for career, houses for love, trees for growth. Everything stays in this browser.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button className="pixel-btn pixel-btn-primary" onClick={store.loadSample}><Sparkles size={14} />Load sample story</button>
                <button className="pixel-btn" onClick={() => { store.setFirstVisit(false); setDrawer({ open: true, editing: null }); }}><Plus size={14} />Start my own</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!store.firstVisit && milestones.length === 0 && store.loaded && (
        <div className="fixed left-1/2 top-24 z-10 -translate-x-1/2">
          <button className="pixel-btn" onClick={store.loadSample}><Sparkles size={14} />Load sample story</button>
        </div>
      )}

      <Timeline milestones={milestones} count={count} onChange={(n) => { setPlaying(false); setCount(n); }} playing={playing} onTogglePlay={togglePlay} />

      <EntryDrawer open={drawer.open} editing={drawer.editing} onClose={() => setDrawer({ open: false, editing: null })}
        onSave={(m) => { drawer.editing ? store.update(m) : store.add(m); setDrawer({ open: false, editing: null }); setSelectedId(m.id); }} />

      {snapOpen && <SnapshotDialog onClose={() => setSnapOpen(false)} getCanvas={() => wrapRef.current?.querySelector("canvas") ?? null}
        stats={`${milestones.length} memories · ${years}`} />}
    </div>
  );
}

const FRAMES = ["#f6efe1", "#ffd36e", "#ff8fb1", "#7fd8e6", "#b9f2a1"];

function SnapshotDialog({ onClose, getCanvas, stats }: { onClose: () => void; getCanvas: () => HTMLCanvasElement | null; stats: string }) {
  const [format, setFormat] = useState<FrameFormat>("square");
  const [caption, setCaption] = useState("My life in pixels");
  const [frame, setFrame] = useState(FRAMES[0]);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-background/60 p-4" onClick={onClose}>
      <div className="glass w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-pixel text-sm">Export snapshot</h2><button onClick={onClose} aria-label="Close"><X size={16} /></button></div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(FORMATS) as FrameFormat[]).map((f) => (
              <button key={f} onClick={() => setFormat(f)} className={`border px-2 py-2 text-[11px] ${format === f ? "border-primary bg-primary text-primary-foreground" : ""}`}>{FORMATS[f].label}</button>
            ))}
          </div>
          <input className="pixel-input" value={caption} maxLength={40} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" />
          <div className="flex gap-2">
            {FRAMES.map((c) => (
              <button key={c} aria-label={`Frame ${c}`} onClick={() => setFrame(c)} className="h-8 w-8 border-2" style={{ background: c, borderColor: frame === c ? "currentColor" : "transparent" }} />
            ))}
          </div>
          <button className="pixel-btn pixel-btn-primary w-full justify-center" onClick={() => {
            const cv = getCanvas(); if (!cv) return;
            exportSnapshot(cv, { format, caption, stats, frameColor: frame }); onClose();
          }}><Camera size={14} />Download PNG</button>
        </div>
      </div>
    </div>
  );
}
