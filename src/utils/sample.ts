import type { Milestone } from "@/types/life";

const m = (
  id: string, title: string, date: string, category: Milestone["category"],
  mood: Milestone["mood"], significance: Milestone["significance"], note = "", tags: string[] = [],
): Milestone => ({ id, title, date, category, mood, significance, note, tags });

export const SAMPLE_STORY: Milestone[] = [
  m("s1", "Moved to the city", "2016-08-21", "Travel", "Energetic", 4, "One suitcase, no plan.", ["move", "fresh start"]),
  m("s2", "First real job", "2017-02-06", "Career", "Vibrant", 4, "Junior designer at a tiny studio.", ["design"]),
  m("s3", "Learned to run 10k", "2017-10-14", "Health", "Energetic", 3, "", ["running"]),
  m("s4", "Met Sam", "2018-05-03", "Relationships", "Vibrant", 5, "Rainy bookshop afternoon.", ["love"]),
  m("s5", "Grandma's goodbye", "2019-01-19", "Relationships", "Melancholy", 5, "Her garden lives on.", ["family"]),
  m("s6", "Started painting again", "2019-07-11", "Creative", "Reflective", 3, "", ["art"]),
  m("s7", "Solo trip to Kyoto", "2020-02-27", "Travel", "Calm", 4, "Temples at dawn.", ["japan"]),
  m("s8", "Therapy, year one", "2020-11-02", "Growth", "Reflective", 4, "", ["mind"]),
  m("s9", "Promoted to lead", "2021-09-15", "Career", "Energetic", 3, "", ["work"]),
  m("s10", "First gallery show", "2022-04-09", "Creative", "Vibrant", 5, "Sold three pieces!", ["art", "show"]),
  m("s11", "Adopted Pixel the cat", "2022-12-24", "Relationships", "Calm", 3, "", ["cat"]),
  m("s12", "Burnout & rest", "2023-06-01", "Health", "Melancholy", 3, "Learned to say no.", ["rest"]),
  m("s13", "Learned to sail", "2024-03-18", "Growth", "Calm", 2, "", ["sea"]),
  m("s14", "Opened my own studio", "2025-05-05", "Career", "Vibrant", 5, "", ["studio"]),
  m("s15", "Iceland road trip", "2026-02-14", "Travel", "Reflective", 4, "Northern lights.", ["aurora"]),
];
