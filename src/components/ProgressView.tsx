import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ReferenceLine,
} from 'recharts'
import { getAllEntries, getAllSessions, getStepGoal } from '../utils/storage'
import { getLastNDays, getShortDay, getStreak } from '../utils/dateUtils'
import type { ExerciseType } from '../types'

export default function ProgressView() {
  const entries = getAllEntries()
  const sessions = getAllSessions()
  const stepGoal = getStepGoal()
  const last14 = getLastNDays(14)
  const streak = getStreak(entries)

  const stepsData = last14.map(date => ({
    day: getShortDay(date),
    steps: entries[date]?.steps ?? 0,
  }))

  const sessionData = last14.map(date => {
    const daySessions = sessions.filter(s => s.date === date)
    const mins = (type: ExerciseType) =>
      daySessions.filter(s => s.type === type).reduce((a, s) => a + s.duration, 0)
    return { day: getShortDay(date), yoga: mins('yoga'), strength: mins('strength'), walk: mins('walk') }
  })

  const daysWithData = Object.keys(entries).length
  const totalSessions = sessions.length
  const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0)
  const avgSteps = daysWithData > 0
    ? Math.round(Object.values(entries).reduce((a, e) => a + e.steps, 0) / daysWithData)
    : 0

  const byType: Record<ExerciseType, number> = { yoga: 0, strength: 0, walk: 0 }
  sessions.forEach(s => { byType[s.type] += 1 })

  const statCards = [
    { value: streak,                           label: 'Day streak',    color: 'text-emerald-400' },
    { value: totalSessions,                    label: 'Sessions',      color: 'text-blue-400'    },
    { value: `${Math.round(totalMinutes/60)}h`, label: 'Active time',  color: 'text-amber-400'   },
  ]

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your fitness journey</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(({ value, label, color }) => (
          <div key={label} className="bg-slate-800 rounded-2xl p-3 text-center">
            <div className={`${color} font-bold text-2xl leading-none`}>{value}</div>
            <div className="text-slate-400 text-xs mt-1.5 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Steps chart */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-slate-200 font-semibold text-sm">Daily Steps</h2>
          <span className="text-slate-500 text-xs">Avg: {avgSteps.toLocaleString()}</span>
        </div>
        <p className="text-slate-500 text-xs mb-4">Last 14 days</p>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={stepsData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#10b981' }}
            />
            <ReferenceLine y={stepGoal} stroke="#334155" strokeDasharray="4 4" label={{ value: 'Goal', position: 'right', fill: '#475569', fontSize: 10 }} />
            <Area type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={2} fill="url(#stepsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sessions chart */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <h2 className="text-slate-200 font-semibold text-sm mb-1">Exercise Minutes</h2>
        <p className="text-slate-500 text-xs mb-4">Last 14 days by type</p>
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={sessionData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }} />
            <Bar dataKey="yoga"     stackId="a" fill="#a855f7" name="Yoga"     />
            <Bar dataKey="strength" stackId="a" fill="#f59e0b" name="Strength" />
            <Bar dataKey="walk"     stackId="a" fill="#3b82f6" name="Walk" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Session breakdown */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-4">
        <h2 className="text-slate-200 font-semibold text-sm">Session Breakdown</h2>
        {([
          { type: 'yoga'     as ExerciseType, label: 'Yoga',     bar: 'bg-purple-500' },
          { type: 'strength' as ExerciseType, label: 'Strength', bar: 'bg-amber-500'  },
          { type: 'walk'     as ExerciseType, label: 'Walk',     bar: 'bg-blue-400'   },
        ]).map(({ type, label, bar }) => {
          const count = byType[type]
          const pct = totalSessions > 0 ? (count / totalSessions) * 100 : 0
          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-300 text-sm">{label}</span>
                <span className="text-slate-500 text-sm">{count} session{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`${bar} h-full rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
