import { Pause, Play } from "lucide-react";
import type { Milestone } from "@/types/life";
import { MOOD_COLORS } from "@/utils/palette";

interface Props {
  milestones: Milestone[];
  count: number;
  onChange: (n: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
}

export function Timeline({ milestones, count, onChange, playing, onTogglePlay }: Props) {
  const n = milestones.length;
  const current = milestones[Math.max(0, count - 1)];
  return (
    <div className="glass fixed bottom-3 left-1/2 z-20 flex w-[min(760px,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-3 px-3 py-2.5">
      <button onClick={onTogglePlay} disabled={!n} className="pixel-btn pixel-btn-primary shrink-0">
        {playing ? <Pause size={14} /> : <Play size={14} />}
        <span className="hidden sm:inline">{playing ? "Pause" : "Play life story"}</span>
      </button>
      <div className="relative flex-1">
        <div className="mb-1 flex h-2 gap-px">
          {milestones.map((m, i) => (
            <div key={m.id} className="flex-1 transition-opacity" style={{ background: MOOD_COLORS[m.mood], opacity: i < count ? 1 : 0.2 }} />
          ))}
        </div>
        <input type="range" min={0} max={n} value={count} disabled={!n} aria-label="Timeline"
          onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
      </div>
      <div className="w-24 shrink-0 text-right font-pixel text-[10px] leading-tight text-muted-foreground">
        {current && count > 0 ? (<><div className="text-foreground">{current.date.slice(0, 4)}</div><div>{count}/{n}</div></>) : "—"}
      </div>
    </div>
  );
}
