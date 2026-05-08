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
  warmupDone: boolean;
  mobilityDone: boolean;
}

export type TabId = 'today' | 'history' | 'progress';
