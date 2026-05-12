import { useState } from 'react'
import { RotateCcw, ChevronDown, ChevronUp, Pencil, Check, Plus, Trash2, Dumbbell, Footprints, Wind } from 'lucide-react'
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

const MEAL_LABELS = ['Meal', 'Snack', 'Meal', 'Snack', 'Meal']

function TypeIcon({ type }: { type: ExerciseType }) {
  if (type === 'yoga') return <Wind size={14} />
  if (type === 'strength') return <Dumbbell size={14} />
  return <Footprints size={14} />
}

const emptyEntry = (date: string): DailyEntry => ({
  date, steps: 0, carsDone: false, meals: [false, false, false, false, false], notes: '',
})

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
    const current = entries[date] ?? emptyEntry(date)
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
        const meals = entry?.meals?.length === 5 ? entry.meals : [false, false, false, false, false]
        const mealsChecked = meals.filter(Boolean).length

        return (
          <div key={date} className="bg-slate-800 rounded-2xl overflow-hidden">
            {/* Header row */}
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
                      {entry?.carsDone && (
                        <span className="flex items-center gap-1 text-emerald-500 text-xs">
                          <RotateCcw size={10} />CARS
                        </span>
                      )}
                      {mealsChecked > 0 && (
                        <span className="text-slate-500 text-xs">{mealsChecked}/5 meals</span>
                      )}
                      {entry?.notes && (
                        <span className="text-slate-600 text-xs italic truncate max-w-[100px]">{entry.notes}</span>
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

                {/* CARS */}
                <button
                  onClick={() => handleUpdateEntry({ carsDone: !(entry?.carsDone ?? false) }, date)}
                  className={`w-full rounded-xl p-3 flex items-center gap-2 transition-all border text-sm ${
                    entry?.carsDone
                      ? 'bg-emerald-900/40 border-emerald-600/50 text-emerald-300'
                      : 'bg-slate-700/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <RotateCcw size={15} className={entry?.carsDone ? 'text-emerald-400' : 'text-slate-500'} />
                  <span className="font-medium">CARS</span>
                  {entry?.carsDone && <Check size={13} className="text-emerald-400 ml-auto" />}
                </button>

                {/* Food Intake */}
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">
                    Food Intake
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {MEAL_LABELS.map((label, i) => {
                      const checked = meals[i]
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            const next = [...meals]
                            next[i] = !next[i]
                            handleUpdateEntry({ meals: next }, date)
                          }}
                          className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 px-1 border transition-all ${
                            checked
                              ? 'bg-emerald-900/40 border-emerald-600/50'
                              : 'bg-slate-700/50 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                          }`}>
                            {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className={`text-[10px] font-medium leading-none ${checked ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-1.5">
                    Notes
                  </span>
                  <textarea
                    value={entry?.notes ?? ''}
                    onChange={e => handleUpdateEntry({ notes: e.target.value }, date)}
                    placeholder="Health observations, mood, motivation, ideas&#8230;"
                    rows={2}
                    className="w-full bg-slate-700/50 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                  />
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
