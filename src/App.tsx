import { useState, useCallback } from 'react'
import type { TabId, DailyEntry, ExerciseSession } from './types'
import { today } from './utils/dateUtils'
import { getEntry, saveEntry, addSession, deleteSession, getSessionsByDate } from './utils/storage'
import Navigation from './components/Navigation'
import TodayView from './components/TodayView'
import HistoryView from './components/HistoryView'
import ProgressView from './components/ProgressView'
import SessionForm from './components/SessionForm'

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [showForm, setShowForm] = useState(false)
  const [entry, setEntry] = useState<DailyEntry>(() => getEntry(today()))
  const [sessions, setSessions] = useState<ExerciseSession[]>(() => getSessionsByDate(today()))

  const updateEntry = useCallback((updates: Partial<DailyEntry>) => {
    setEntry(prev => {
      const next = { ...prev, ...updates }
      saveEntry(next)
      return next
    })
  }, [])

  const handleAddSession = useCallback((session: ExerciseSession) => {
    addSession(session)
    setSessions(prev => [...prev, session])
    setShowForm(false)
  }, [])

  const handleDeleteSession = useCallback((id: string) => {
    deleteSession(id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20 max-w-md mx-auto w-full">
        {tab === 'today' && (
          <TodayView
            entry={entry}
            sessions={sessions}
            onUpdate={updateEntry}
            onAddSession={() => setShowForm(true)}
            onDeleteSession={handleDeleteSession}
          />
        )}
        {tab === 'history' && <HistoryView />}
        {tab === 'progress' && <ProgressView />}
      </div>

      <Navigation tab={tab} onTabChange={setTab} />

      {showForm && (
        <SessionForm
          onAdd={handleAddSession}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
