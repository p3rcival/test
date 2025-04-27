export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number   // new: only for time-mode
  weight?: number;
  videoUrls?: string[];
  notes?: string;
}

export interface DaySchedule {
  date: string;
  exercises: Exercise[];
}

export type WorkoutSchedule = Record<string, DaySchedule>;