import { setHours, startOfToday, startOfTomorrow } from 'date-fns'
import { DayOrWeekView, DayOrWeekViewType, Event } from './day-or-week-view'
import { nl } from 'date-fns/locale'
import { useState } from 'react'

export function App() {
  const [viewingDate, setViewingDate] = useState(new Date())
  const [view, setView] = useState<DayOrWeekViewType>(
    window.innerWidth < 768 ? 'day' : 'week'
  )

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      start: setHours(startOfToday(), 15),
      end: setHours(startOfToday(), 17),
      title: 'Spons halen',
    },
    {
      id: '2',
      start: setHours(startOfToday(), 20),
      end: setHours(startOfTomorrow(), 4),
      title: 'Werken',
    },
    {
      id: '3',
      start: setHours(startOfToday(), 16),
      end: setHours(startOfToday(), 22),
      title: 'Werken',
    },
    {
      id: '4',
      start: setHours(startOfToday(), 5),
      end: setHours(startOfToday(), 7),
      title: 'Werken',
    },
  ])

  return (
    <DayOrWeekView
      viewingDate={viewingDate}
      onChangeViewingDate={setViewingDate}
      weekStartsOn={1}
      locale={nl}
      view={view}
      events={events}
      onChangeView={setView}
      onEventsChange={setEvents}
    />
  )
}
