import { Home, Calendar, TrendingUp } from 'lucide-react'
import type { TabId } from '../types'

interface Props {
  tab: TabId
  onTabChange: (tab: TabId) => void
}

const TABS: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: 'today', label: 'Today', Icon: Home },
  { id: 'history', label: 'History', Icon: Calendar },
  { id: 'progress', label: 'Progress', Icon: TrendingUp },
]

export default function Navigation({ tab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-10 safe-area-pb">
      <div className="max-w-md mx-auto flex">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              tab === id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={22} strokeWidth={tab === id ? 2.5 : 1.8} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
