import { setHours, startOfDay } from 'date-fns'
import { DayOrWeekView, DayOrWeekViewType, Event } from './day-or-week-view'
import { nl } from 'date-fns/locale'
import { useState } from 'react'

export function App() {
  const now = new Date()

  const [viewingDate, setViewingDate] = useState(new Date())
  const [view, setView] = useState<DayOrWeekViewType>(
    window.innerWidth < 768 ? 'day' : 'week'
  )

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      start: setHours(startOfDay(now), 16.5),
      end: setHours(startOfDay(now), 17),
      title: 'Spons halen',
    },
    {
      id: '2',
      start: setHours(startOfDay(now), 8),
      end: setHours(startOfDay(now), 16),
      title: 'Werken',
    },
  ])

  return (
    <div className="pb-80">
      <DayOrWeekView
        viewingDate={viewingDate}
        onChangeViewingDate={setViewingDate}
        weekStartsOn={1}
        locale={nl}
        view={view}
        onChangeView={setView}
        events={events}
        onEventsChange={setEvents}
      />
    </div>
  )
}
