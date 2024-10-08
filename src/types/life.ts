export const CATEGORIES = ["Career", "Relationships", "Growth", "Health", "Creative", "Travel"] as const;
export type Category = (typeof CATEGORIES)[number];

export const MOODS = ["Vibrant", "Calm", "Melancholy", "Energetic", "Reflective"] as const;
export type Mood = (typeof MOODS)[number];

export interface Milestone {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  category: Category;
  mood: Mood;
  significance: 1 | 2 | 3 | 4 | 5;
  note?: string;
  tags: string[];
}

export type ViewMode = "island" | "constellation";
