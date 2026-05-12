# FitDiary — Claude Code Guide

## What this is
Personal fitness PWA (Progressive Web App). No backend — all data lives in `localStorage`. Built with React 18 + TypeScript + Vite + Tailwind CSS v3 + Recharts + lucide-react.

## Running locally
```
npm run dev      # dev server
npm run build    # production build (runs tsc then vite)
```

## Deploy
Push to `main` on GitHub. Netlify auto-deploys via `netlify.toml` (`npm run build`, publish `dist/`).

## Data model
All data persists in three `localStorage` keys:

| Key | Type | Description |
|---|---|---|
| `fd_entries` | `Record<YYYY-MM-DD, DailyEntry>` | Daily log — steps, CARS, meals, notes |
| `fd_sessions` | `ExerciseSession[]` | Exercise sessions with type/duration/notes |
| `fd_step_goal` | `number` | Step goal (default 8000) |

### DailyEntry shape
```ts
{ date, steps, carsDone, meals: boolean[5], notes }
```
- `carsDone` — single toggle for Controlled Articular Rotations (replaced the old `warmupDone` + `mobilityDone`)
- `meals` — 5-slot array: [Meal, Snack, Meal, Snack, Meal]
- `notes` — freeform daily notes string

Migration: `getAllEntries()` in `storage.ts` auto-migrates old `warmupDone`/`mobilityDone` entries to `carsDone` on first load.

### ExerciseSession types
`'yoga' | 'strength' | 'walk'` — adding a new type requires updating the `ExerciseType` union in `src/types/index.ts` and the `TYPE_CONFIG` / `TYPE_DOT` / `TYPE_LABEL` maps in `TodayView.tsx` and `HistoryView.tsx`.

## Key files
```
src/types/index.ts           — all shared TypeScript types
src/utils/storage.ts         — all localStorage read/write; exportBackup/importBackup here
src/utils/dateUtils.ts       — today(), formatDate(), getLastNDays(), getStreak(), getShortDay()
src/App.tsx                  — root state for today's entry + sessions; tab routing
src/components/TodayView.tsx — steps, CARS, food intake, notes, session list
src/components/HistoryView.tsx — last 29 days (excludes today), fully editable inline
src/components/ProgressView.tsx — charts + stat cards + data backup (Export/Import)
src/components/SessionForm.tsx  — bottom-sheet modal; accepts optional `date` prop for past entries
src/components/Navigation.tsx   — bottom tab bar
public/sw.js                 — service worker: network-first for navigation, cache-first for assets
```

## Service worker strategy
Navigation requests (HTML) use **network-first** so new Netlify deploys are immediately visible. Static assets (JS/CSS, content-hashed by Vite) use **cache-first** for offline support. Cache name is `fitdiary-v1`.

## Backup / restore
Progress tab → Data section. Export downloads `fitdiary-backup-YYYY-MM-DD.json`. Import reads that file back and reloads the page. Functions live in `src/utils/storage.ts` (`exportBackup`, `importBackup`).

## Streak logic
`getStreak()` in `dateUtils.ts` counts consecutive days where at least one of `steps`, `carsDone`, or any `meals` slot is truthy.
