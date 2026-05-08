import type { DailyEntry, ExerciseSession } from '../types';

const ENTRIES_KEY = 'fd_entries';
const SESSIONS_KEY = 'fd_sessions';
const STEP_GOAL_KEY = 'fd_step_goal';

export function getStepGoal(): number {
  return parseInt(localStorage.getItem(STEP_GOAL_KEY) ?? '8000');
}

export function setStepGoal(goal: number): void {
  localStorage.setItem(STEP_GOAL_KEY, String(goal));
}

export function getAllEntries(): Record<string, DailyEntry> {
  const raw = localStorage.getItem(ENTRIES_KEY);
  return raw ? (JSON.parse(raw) as Record<string, DailyEntry>) : {};
}

export function getEntry(date: string): DailyEntry {
  const entries = getAllEntries();
  return entries[date] ?? { date, steps: 0, warmupDone: false, mobilityDone: false };
}

export function saveEntry(entry: DailyEntry): void {
  const entries = getAllEntries();
  entries[entry.date] = entry;
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getAllSessions(): ExerciseSession[] {
  const raw = localStorage.getItem(SESSIONS_KEY);
  return raw ? (JSON.parse(raw) as ExerciseSession[]) : [];
}

export function getSessionsByDate(date: string): ExerciseSession[] {
  return getAllSessions().filter(s => s.date === date);
}

export function addSession(session: ExerciseSession): void {
  const sessions = getAllSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = getAllSessions().filter(s => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
