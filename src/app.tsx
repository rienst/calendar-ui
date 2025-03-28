import { DayOrWeekView, DayOrWeekViewType, Event } from './day-or-week-view'
import { useState } from 'react'

export function App() {
  const [viewingDate, setViewingDate] = useState(new Date())
  const [view, setView] = useState<DayOrWeekViewType>(
    window.innerWidth < 768 ? 'day' : 'week'
  )

  const [events, setEvents] = useState<Event[]>([])

  return (
    <DayOrWeekView
      viewingDate={viewingDate}
      onChangeViewingDate={setViewingDate}
      weekStartsOn={1}
      view={view}
      events={events}
      onChangeView={setView}
      onEventsChange={setEvents}
      onEventSketched={sketch =>
        setEvents([
          ...events,
          {
            id: Math.random().toString(),
            ...sketch,
          },
        ])
      }
    />
  )
}
