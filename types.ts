export interface Exercise {
  id: string
  name: string
  sets: number
  reps?: number      // optional when timed
  duration?: number  // in seconds, optional when rep-based
  weight?: number
  videoUrls?: string[]
  notes?: string
}

export interface DaySchedule {
  date: string;
  exercises: Exercise[];
}

export type WorkoutSchedule = Record<string, DaySchedule>;