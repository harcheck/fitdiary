import type { DailyEntry, ExerciseSession } from '../types';

const ENTRIES_KEY = 'fd_entries';
const SESSIONS_KEY = 'fd_sessions';
const STEP_GOAL_KEY = 'fd_step_goal';

const EMPTY_MEALS = (): boolean[] => [false, false, false, false, false];

export function getStepGoal(): number {
  return parseInt(localStorage.getItem(STEP_GOAL_KEY) ?? '8000');
}

export function setStepGoal(goal: number): void {
  localStorage.setItem(STEP_GOAL_KEY, String(goal));
}

export function getAllEntries(): Record<string, DailyEntry> {
  const raw = localStorage.getItem(ENTRIES_KEY);
  if (!raw) return {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries = JSON.parse(raw) as Record<string, any>;
  let dirty = false;
  for (const key of Object.keys(entries)) {
    const e = entries[key];
    // Migrate warmupDone/mobilityDone → carsDone
    if (e.carsDone === undefined) {
      e.carsDone = !!(e.warmupDone || e.mobilityDone);
      dirty = true;
    }
    if (!Array.isArray(e.meals)) {
      e.meals = EMPTY_MEALS();
      dirty = true;
    }
    if (e.notes === undefined) {
      e.notes = '';
      dirty = true;
    }
  }
  if (dirty) localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return entries as Record<string, DailyEntry>;
}

export function getEntry(date: string): DailyEntry {
  const entries = getAllEntries();
  return entries[date] ?? { date, steps: 0, carsDone: false, meals: EMPTY_MEALS(), notes: '' };
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

export function exportBackup(): string {
  return JSON.stringify({
    version: 2,
    exportedAt: new Date().toISOString(),
    [ENTRIES_KEY]: localStorage.getItem(ENTRIES_KEY),
    [SESSIONS_KEY]: localStorage.getItem(SESSIONS_KEY),
    [STEP_GOAL_KEY]: localStorage.getItem(STEP_GOAL_KEY),
  }, null, 2);
}

export function importBackup(json: string): void {
  const data = JSON.parse(json) as Record<string, unknown>;
  if (typeof data !== 'object' || data === null) throw new Error('Invalid backup file');
  if (data[ENTRIES_KEY] != null) localStorage.setItem(ENTRIES_KEY, String(data[ENTRIES_KEY]));
  if (data[SESSIONS_KEY] != null) localStorage.setItem(SESSIONS_KEY, String(data[SESSIONS_KEY]));
  if (data[STEP_GOAL_KEY] != null) localStorage.setItem(STEP_GOAL_KEY, String(data[STEP_GOAL_KEY]));
}
