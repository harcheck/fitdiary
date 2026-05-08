import { useState } from 'react'
import { Flame, Activity, ChevronDown, ChevronUp, Pencil, Check, Plus, Trash2, Dumbbell, Footprints, Wind } from 'lucide-react'
import { getAllEntries, getAllSessions, saveEntry, addSession, deleteSession } from '../utils/storage'
import { getLastNDays, formatDate, today } from '../utils/dateUtils'
import type { DailyEntry, ExerciseSession, ExerciseType } from '../types'
import SessionForm from './SessionForm'

const TYPE_DOT: Record<ExerciseType, string> = {
  yoga:     'bg-purple-500',
  strength: 'bg-amber-500',
  walk:     'bg-blue-400',
}

const TYPE_LABEL: Record<ExerciseType, string> = {
  yoga:     'Yoga',
  strength: 'Strength',
  walk:     'Walk',
}

function TypeIcon({ type }: { type: ExerciseType }) {
  if (type === 'yoga') return <Wind size={14} />
  if (type === 'strength') return <Dumbbell size={14} />
  return <Footprints size={14} />
}

export default function HistoryView() {
  const [entries, setEntries] = useState<Record<string, DailyEntry>>(() => getAllEntries())
  const [allSessions, setAllSessions] = useState<ExerciseSession[]>(() => getAllSessions())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editingStepsFor, setEditingStepsFor] = useState<string | null>(null)
  const [stepInput, setStepInput] = useState('')
  const [addingSessionFor, setAddingSessionFor] = useState<string | null>(null)

  // Exclude today — it's managed in TodayView
  const days = getLastNDays(30).reverse().filter(d => d !== today())

  const handleUpdateEntry = (updates: Partial<DailyEntry>, date: string) => {
    const current = entries[date] ?? { date, steps: 0, warmupDone: false, mobilityDone: false }
    const next = { ...current, ...updates }
    saveEntry(next)
    setEntries(prev => ({ ...prev, [date]: next }))
  }

  const handleDeleteSession = (id: string) => {
    deleteSession(id)
    setAllSessions(prev => prev.filter(s => s.id !== id))
  }

  const handleAddSession = (session: ExerciseSession) => {
    addSession(session)
    setAllSessions(prev => [...prev, session])
    setAddingSessionFor(null)
  }

  const openStepEdit = (date: string) => {
    setStepInput(String(entries[date]?.steps ?? 0))
    setEditingStepsFor(date)
  }

  const commitSteps = (date: string) => {
    const val = Math.max(0, parseInt(stepInput) || 0)
    handleUpdateEntry({ steps: val }, date)
    setEditingStepsFor(null)
  }

  return (
    <div className="p-4 space-y-3">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">History</h1>
        <p className="text-slate-400 text-sm mt-0.5">Last 30 days</p>
      </div>

      {days.map(date => {
        const entry = entries[date]
        const sessions = allSessions.filter(s => s.date === date)
        const hasData = entry || sessions.length > 0
        const isOpen = expanded === date
        const isEditingSteps = editingStepsFor === date

        return (
          <div key={date} className="bg-slate-800 rounded-2xl overflow-hidden">
            {/* Header row — click to expand/collapse */}
            <button
              onClick={() => setExpanded(isOpen ? null : date)}
              className="w-full px-4 py-3 text-left transition-colors hover:bg-slate-700/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{formatDate(date)}</div>
                  {hasData ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      {entry?.steps ? (
                        <span className="text-slate-400 text-xs">{entry.steps.toLocaleString()} steps</span>
                      ) : null}
                      {entry?.warmupDone && (
                        <span className="flex items-center gap-1 text-emerald-500 text-xs">
                          <Flame size={10} />Warmup
                        </span>
                      )}
                      {entry?.mobilityDone && (
                        <span className="flex items-center gap-1 text-emerald-500 text-xs">
                          <Activity size={10} />Mobility
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-600 text-xs mt-1 block">Tap to add data</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {sessions.length > 0 && (
                    <div className="flex gap-1">
                      {sessions.map(s => (
                        <span key={s.id} className={`w-2.5 h-2.5 rounded-full ${TYPE_DOT[s.type]}`} />
                      ))}
                    </div>
                  )}
                  {isOpen
                    ? <ChevronUp size={16} className="text-slate-500" />
                    : <ChevronDown size={16} className="text-slate-500" />
                  }
                </div>
              </div>
            </button>

            {/* Expanded edit panel */}
            {isOpen && (
              <div className="px-4 pb-4 pt-3 border-t border-slate-700 space-y-4">

                {/* Steps */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Steps</span>
                    {!isEditingSteps && (
                      <button
                        onClick={() => openStepEdit(date)}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1 -m-1"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                  {isEditingSteps ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={stepInput}
                        onChange={e => setStepInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commitSteps(date) }}
                        onBlur={() => commitSteps(date)}
                        className="bg-slate-700 text-white text-2xl font-bold w-full rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                        min={0}
                        max={99999}
                      />
                      <button
                        onClick={() => commitSteps(date)}
                        className="bg-emerald-500 text-white rounded-xl p-2.5 hover:bg-emerald-400 transition-colors flex-shrink-0"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => openStepEdit(date)} className="text-left">
                      <span className="text-2xl font-bold text-white">
                        {(entry?.steps ?? 0).toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-sm ml-2">steps</span>
                    </button>
                  )}
                </div>

                {/* Warmup + Mobility */}
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'warmupDone' as const, label: 'Warmup', Icon: Flame },
                    { key: 'mobilityDone' as const, label: 'Mobility', Icon: Activity },
                  ]).map(({ key, label, Icon }) => {
                    const done = entry?.[key] ?? false
                    return (
                      <button
                        key={key}
                        onClick={() => handleUpdateEntry({ [key]: !done }, date)}
                        className={`rounded-xl p-3 flex items-center gap-2 transition-all border text-sm ${
                          done
                            ? 'bg-emerald-900/40 border-emerald-600/50 text-emerald-300'
                            : 'bg-slate-700/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <Icon size={15} className={done ? 'text-emerald-400' : 'text-slate-500'} />
                        <span className="font-medium">{label}</span>
                        {done && <Check size={13} className="text-emerald-400 ml-auto" />}
                      </button>
                    )
                  })}
                </div>

                {/* Sessions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Sessions</span>
                    <button
                      onClick={() => setAddingSessionFor(date)}
                      className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 text-xs font-semibold transition-colors"
                    >
                      <Plus size={13} />
                      Add
                    </button>
                  </div>
                  {sessions.length === 0 ? (
                    <p className="text-slate-600 text-xs">No sessions logged</p>
                  ) : (
                    <div className="space-y-1.5">
                      {sessions.map(s => (
                        <div key={s.id} className="flex items-center gap-2 text-sm">
                          <span className={`w-2 h-2 rounded-full ${TYPE_DOT[s.type]} flex-shrink-0`} />
                          <span className="text-slate-300 flex items-center gap-1">
                            <TypeIcon type={s.type} />
                            {TYPE_LABEL[s.type]}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{s.duration} min</span>
                          {s.notes && (
                            <span className="text-slate-500 text-xs truncate flex-1">{s.notes}</span>
                          )}
                          <button
                            onClick={() => handleDeleteSession(s.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors p-1 ml-auto flex-shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )
      })}

      {addingSessionFor && (
        <SessionForm
          date={addingSessionFor}
          onAdd={handleAddSession}
          onClose={() => setAddingSessionFor(null)}
        />
      )}
    </div>
  )
}
