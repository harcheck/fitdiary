import { useState } from 'react'
import { X, Check } from 'lucide-react'
import type { ExerciseSession, ExerciseType } from '../types'
import { today, formatDate } from '../utils/dateUtils'

interface Props {
  date?: string
  onAdd: (session: ExerciseSession) => void
  onClose: () => void
}

const TYPES: { id: ExerciseType; label: string; emoji: string; desc: string }[] = [
  { id: 'yoga',     label: 'Yoga',     emoji: '🧘', desc: 'Flow, flexibility & mindfulness' },
  { id: 'strength', label: 'Strength', emoji: '💪', desc: 'TRX & resistance bands'          },
  { id: 'walk',     label: 'Walk',     emoji: '🚶', desc: 'Extended walk or hike'            },
]

export default function SessionForm({ date, onAdd, onClose }: Props) {
  const [type, setType] = useState<ExerciseType>('yoga')
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')

  const targetDate = date ?? today()

  const handleSubmit = () => {
    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: targetDate,
      type,
      duration,
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end z-20"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-t-3xl w-full max-w-md mx-auto p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto -mt-2 mb-1" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Log Session</h2>
            {date && <p className="text-slate-400 text-sm mt-0.5">{formatDate(date)}</p>}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <X size={22} />
          </button>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Activity</label>
          <div className="space-y-2">
            {TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  type === t.id
                    ? 'bg-emerald-900/40 border-emerald-600/60 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="text-2xl">{t.emoji}</span>
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </div>
                {type === t.id && <Check size={17} className="text-emerald-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Duration</label>
            <span className="text-white font-bold tabular-nums">{duration} min</span>
          </div>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-slate-700 cursor-pointer"
          />
          <div className="flex justify-between text-slate-500 text-xs">
            <span>5 min</span>
            <span>2 hours</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How did it go?"
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl transition-colors text-base"
        >
          Save Session
        </button>
      </div>
    </div>
  )
}
