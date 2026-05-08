import { useState } from 'react'
import { Flame, Activity, Plus, Trash2, Dumbbell, Footprints, Wind, Check, Pencil } from 'lucide-react'
import type { DailyEntry, ExerciseSession, ExerciseType } from '../types'
import { today, formatDate, getStreak } from '../utils/dateUtils'
import { getAllEntries, getStepGoal } from '../utils/storage'

const MOTIVATIONS = [
  'Every rep counts. Every step matters.',
  'Consistency beats intensity.',
  'Your future self is watching.',
  'Show up, even on the hard days.',
  'Progress, not perfection.',
  'Small steps. Big changes.',
  'Movement is medicine.',
]

const TYPE_CONFIG: Record<ExerciseType, { label: string; color: string; bg: string; border: string }> = {
  yoga:     { label: 'Yoga',     color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-800/50' },
  strength: { label: 'Strength', color: 'text-amber-400',  bg: 'bg-amber-900/30',  border: 'border-amber-800/50'  },
  walk:     { label: 'Walk',     color: 'text-blue-400',   bg: 'bg-blue-900/30',   border: 'border-blue-800/50'   },
}

function TypeIcon({ type, size = 20 }: { type: ExerciseType; size?: number }) {
  if (type === 'yoga') return <Wind size={size} />
  if (type === 'strength') return <Dumbbell size={size} />
  return <Footprints size={size} />
}

interface Props {
  entry: DailyEntry
  sessions: ExerciseSession[]
  onUpdate: (updates: Partial<DailyEntry>) => void
  onAddSession: () => void
  onDeleteSession: (id: string) => void
}

export default function TodayView({ entry, sessions, onUpdate, onAddSession, onDeleteSession }: Props) {
  const [editingSteps, setEditingSteps] = useState(false)
  const [stepInput, setStepInput] = useState(String(entry.steps))

  const goal = getStepGoal()
  const stepPct = Math.min(100, (entry.steps / goal) * 100)
  const motivation = MOTIVATIONS[new Date().getDay() % MOTIVATIONS.length]
  const streak = getStreak(getAllEntries())

  const allDone = entry.warmupDone && entry.mobilityDone && sessions.length > 0

  const commitSteps = () => {
    const val = Math.max(0, parseInt(stepInput) || 0)
    onUpdate({ steps: val })
    setStepInput(String(val))
    setEditingSteps(false)
  }

  const openStepEdit = () => {
    setStepInput(String(entry.steps))
    setEditingSteps(true)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{formatDate(today())}</h1>
          <p className="text-slate-400 text-sm mt-0.5 max-w-[220px]">{motivation}</p>
        </div>
        {streak > 0 && (
          <div className="flex flex-col items-center bg-emerald-900/40 border border-emerald-700/50 rounded-2xl px-3 py-2 min-w-[60px]">
            <span className="text-emerald-400 font-bold text-xl leading-none">{streak}</span>
            <span className="text-emerald-600 text-[10px] mt-0.5 font-medium uppercase tracking-wide">streak</span>
          </div>
        )}
      </div>

      {/* All-done banner */}
      {allDone && (
        <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-2xl p-3 flex items-center gap-2">
          <Check size={18} className="text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-300 text-sm font-medium">Great work — all done for today!</p>
        </div>
      )}

      {/* Steps */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Steps</span>
          {!editingSteps && (
            <button onClick={openStepEdit} className="text-slate-500 hover:text-slate-300 transition-colors p-1 -m-1">
              <Pencil size={14} />
            </button>
          )}
        </div>

        {editingSteps ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={stepInput}
              onChange={e => setStepInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitSteps() }}
              onBlur={commitSteps}
              className="bg-slate-700 text-white text-3xl font-bold w-full rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
              min={0}
              max={99999}
            />
            <button
              onClick={commitSteps}
              className="bg-emerald-500 text-white rounded-xl p-3 hover:bg-emerald-400 transition-colors flex-shrink-0"
            >
              <Check size={20} />
            </button>
          </div>
        ) : (
          <button onClick={openStepEdit} className="w-full text-left">
            <span className="text-4xl font-bold text-white">{entry.steps.toLocaleString()}</span>
            <span className="text-slate-500 text-base font-normal ml-2">/ {goal.toLocaleString()}</span>
          </button>
        )}

        <div className="mt-3 bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${stepPct}%` }}
          />
        </div>
        <div className="text-slate-500 text-xs mt-1.5">{Math.round(stepPct)}% of {goal.toLocaleString()} goal</div>
      </div>

      {/* Routines */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { key: 'warmupDone' as const, label: 'Warmup', Icon: Flame, desc: 'Daily warmup' },
          { key: 'mobilityDone' as const, label: 'Mobility', Icon: Activity, desc: 'Mobility work' },
        ]).map(({ key, label, Icon, desc }) => {
          const done = entry[key]
          return (
            <button
              key={key}
              onClick={() => onUpdate({ [key]: !done })}
              className={`rounded-2xl p-4 flex flex-col items-center gap-2 transition-all border ${
                done
                  ? 'bg-emerald-900/40 border-emerald-600/50'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Icon
                size={30}
                className={done ? 'text-emerald-400' : 'text-slate-500'}
                strokeWidth={1.8}
              />
              <span className={`font-semibold text-sm ${done ? 'text-emerald-300' : 'text-slate-300'}`}>
                {label}
              </span>
              <span className={`text-xs ${done ? 'text-emerald-500' : 'text-slate-500'}`}>
                {done ? 'Done ✓' : desc}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Sessions</span>
          <button
            onClick={onAddSession}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl px-3 py-1.5 transition-colors"
          >
            <Plus size={14} />
            Log session
          </button>
        </div>

        {sessions.length === 0 ? (
          <button
            onClick={onAddSession}
            className="w-full bg-slate-800/60 border border-dashed border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-2 text-slate-500 hover:text-slate-400 hover:border-slate-600 transition-colors"
          >
            <Plus size={22} />
            <span className="text-sm">Log your first session today</span>
          </button>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => {
              const cfg = TYPE_CONFIG[session.type]
              return (
                <div
                  key={session.id}
                  className={`flex items-center gap-3 ${cfg.bg} border ${cfg.border} rounded-2xl px-4 py-3`}
                >
                  <span className={cfg.color}>
                    <TypeIcon type={session.type} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-slate-400 text-sm">{session.duration} min</span>
                    </div>
                    {session.notes && (
                      <p className="text-slate-400 text-xs mt-0.5 truncate">{session.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
