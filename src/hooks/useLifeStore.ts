import { useCallback, useEffect, useState } from "react";
import type { Milestone } from "@/types/life";
import { SAMPLE_STORY } from "@/utils/sample";

const KEY = "life-in-pixels:v1";

export function sortByDate(list: Milestone[]) {
  return [...list].sort((a, b) => a.date.localeCompare(b.date));
}

export function parseBackup(raw: string): Milestone[] {
  const data = JSON.parse(raw);
  const list = Array.isArray(data) ? data : data?.milestones;
  if (!Array.isArray(list)) throw new Error("Invalid backup file");
  return list.filter((x) => x && typeof x.title === "string" && typeof x.date === "string")
    .map((x) => ({ tags: [], ...x, id: String(x.id ?? crypto.randomUUID()) }));
}

export function useLifeStore() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try { setMilestones(sortByDate(parseBackup(raw))); } catch { /* ignore */ }
    } else {
      setFirstVisit(true);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ version: 1, milestones }));
  }, [milestones, loaded]);

  const add = useCallback((m: Milestone) => setMilestones((l) => sortByDate([...l, m])), []);
  const update = useCallback((m: Milestone) => setMilestones((l) => sortByDate(l.map((x) => (x.id === m.id ? m : x)))), []);
  const remove = useCallback((id: string) => setMilestones((l) => l.filter((x) => x.id !== id)), []);
  const replaceAll = useCallback((l: Milestone[]) => { setMilestones(sortByDate(l)); setFirstVisit(false); }, []);
  const loadSample = useCallback(() => replaceAll(SAMPLE_STORY), [replaceAll]);

  return { milestones, loaded, firstVisit, setFirstVisit, add, update, remove, replaceAll, loadSample };
}
