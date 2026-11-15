export type StudyPlanWeek = {
  dates: string;
  topics: string;
  practice: "normal" | "holiday";
};

export const FIRST_PASS_WEEKS: readonly StudyPlanWeek[] = [
  { dates: "16–22 nov", topics: "I.1–I.3", practice: "normal" },
  { dates: "23–29 nov", topics: "I.4–I.6", practice: "normal" },
  { dates: "30 nov–6 dic", topics: "I.7–I.8", practice: "normal" },
  { dates: "7–13 dic", topics: "I.9–I.10", practice: "normal" },
  { dates: "14–20 dic", topics: "II.1–II.4", practice: "normal" },
  { dates: "21–27 dic", topics: "II.5–II.8", practice: "normal" },
  { dates: "28 dic–3 ene", topics: "II.9–II.11", practice: "holiday" },
  { dates: "4–10 ene", topics: "II.12–II.16", practice: "normal" },
  { dates: "11–17 ene", topics: "III.1–III.4", practice: "normal" },
  { dates: "18–24 ene", topics: "III.5–III.8", practice: "normal" },
  { dates: "25–31 ene", topics: "III.9–III.11", practice: "normal" },
  { dates: "1–7 feb", topics: "III.12–III.15", practice: "normal" },
  { dates: "8–14 feb", topics: "IV.1–IV.4", practice: "normal" },
  { dates: "15–21 feb", topics: "IV.5–IV.8", practice: "normal" },
  { dates: "22–28 feb", topics: "IV.9–IV.12", practice: "normal" },
  { dates: "1–7 mar", topics: "IV.13–IV.16", practice: "normal" },
] as const;

export const SECOND_PASS_WEEKS = [
  { dates: "8–14 mar", topics: "Bloque I" },
  { dates: "15–21 mar", topics: "Bloque II" },
  { dates: "22–28 mar", topics: "Bloque III" },
  { dates: "29 mar–4 abr", topics: "Bloque IV" },
] as const;

export const PLAN_MILESTONES = [
  { date: "13 dic", completed: 10 },
  { date: "10 ene", completed: 26 },
  { date: "7 feb", completed: 41 },
  { date: "7 mar", completed: 57 },
] as const;
