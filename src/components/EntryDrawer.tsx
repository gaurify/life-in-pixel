import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CATEGORIES, MOODS, type Milestone } from "@/types/life";
import { CATEGORY_GLYPH, MOOD_COLORS } from "@/utils/palette";

interface Props {
  open: boolean;
  editing: Milestone | null;
  onClose: () => void;
  onSave: (m: Milestone) => void;
}

const blank = (): Milestone => ({
  id: crypto.randomUUID(), title: "", date: new Date().toISOString().slice(0, 10),
  category: "Growth", mood: "Calm", significance: 3, note: "", tags: [],
});

export function EntryDrawer({ open, editing, onClose, onSave }: Props) {
  const [m, setM] = useState<Milestone>(blank);
  const [tags, setTags] = useState("");
  useEffect(() => {
    if (open) { const v = editing ?? blank(); setM(v); setTags(v.tags.join(", ")); }
  }, [open, editing]);

  const set = <K extends keyof Milestone>(k: K, v: Milestone[K]) => setM((p) => ({ ...p, [k]: v }));
  const moodIdx = MOODS.indexOf(m.mood);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="glass fixed right-3 top-3 bottom-3 z-30 w-[min(380px,calc(100vw-1.5rem))] overflow-y-auto p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-pixel text-sm">{editing ? "Edit memory" : "New memory"}</h2>
            <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            if (!m.title.trim()) return;
            onSave({ ...m, title: m.title.trim(), tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
          }}>
            <Field label="Title"><input className="pixel-input" required value={m.title} maxLength={80} onChange={(e) => set("title", e.target.value)} placeholder="First day at the new job" /></Field>
            <Field label="Date"><input type="date" className="pixel-input" required value={m.date} onChange={(e) => set("date", e.target.value)} /></Field>
            <Field label="Category">
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map((c) => (
                  <button type="button" key={c} onClick={() => set("category", c)}
                    className={`border px-2 py-2 text-xs transition ${m.category === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                    <span className="mr-1">{CATEGORY_GLYPH[c]}</span>{c}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`Mood · ${m.mood}`}>
              <input type="range" min={0} max={MOODS.length - 1} value={moodIdx} className="w-full"
                onChange={(e) => set("mood", MOODS[Number(e.target.value)])} />
              <div className="mt-1 flex justify-between">
                {MOODS.map((md) => (
                  <span key={md} title={md} className="h-3 w-3" style={{ background: MOOD_COLORS[md], outline: md === m.mood ? "2px solid currentColor" : "none" }} />
                ))}
              </div>
            </Field>
            <Field label={`Significance · ${m.significance}`}>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => set("significance", n as Milestone["significance"])}
                    className={`h-8 flex-1 border font-pixel text-xs ${n <= m.significance ? "bg-primary text-primary-foreground border-primary" : ""}`}>{n}</button>
                ))}
              </div>
            </Field>
            <Field label="Note"><textarea className="pixel-input min-h-20" maxLength={500} value={m.note} onChange={(e) => set("note", e.target.value)} placeholder="What do you want to remember?" /></Field>
            <Field label="Tags (comma separated)"><input className="pixel-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="family, summer" /></Field>
            <button type="submit" className="pixel-btn pixel-btn-primary w-full justify-center">{editing ? "Save changes" : "Plant memory"}</button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-pixel text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
