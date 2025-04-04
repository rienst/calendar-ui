import { DayOrWeekView, DayOrWeekViewType, Event } from './day-or-week-view'
import { useState } from 'react'
import { ProjectBanner } from './project-banner'

export function App() {
  const [viewingDate, setViewingDate] = useState(new Date())
  const [view, setView] = useState<DayOrWeekViewType>(
    window.innerWidth < 768 ? 'day' : 'week'
  )

  const [selectedEventId, setSelectedEventId] = useState<string>()
  const [events, setEvents] = useState<Event[]>([])

  return (
    <>
      <ProjectBanner />

      <DayOrWeekView
        viewingDate={viewingDate}
        onChangeViewingDate={setViewingDate}
        weekStartsOn={1}
        view={view}
        events={events}
        onChangeView={setView}
        selectedEventId={selectedEventId}
        onEventSelected={setSelectedEventId}
        onEventsChange={setEvents}
        onEventSketched={sketch => {
          const id = Math.random().toString()
          setEvents([...events, { id, ...sketch }])
          setSelectedEventId(id)
        }}
      />
    </>
  )
}
