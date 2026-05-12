export type ExerciseType = 'yoga' | 'strength' | 'walk';

export interface ExerciseSession {
  id: string;
  date: string;
  type: ExerciseType;
  duration: number;
  notes: string;
  timestamp: string;
}

export interface DailyEntry {
  date: string;
  steps: number;
  carsDone: boolean;
  meals: boolean[];   // [meal, snack, meal, snack, meal]
  notes: string;
}

export type TabId = 'today' | 'history' | 'progress';
