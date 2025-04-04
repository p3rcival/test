export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  videoUrls?: string[];
  notes?: string;
}

export interface DaySchedule {
  date: string;
  exercises: Exercise[];
}

export type WorkoutSchedule = Record<string, DaySchedule>;