import { addDays, isToday } from 'date-fns'
import { CurrentHourMarker } from './current-hour-marker'

export interface EventAreaGridProps {
  start: Date
  days: number
  hours: number
}

export function EventAreaGrid(props: EventAreaGridProps) {
  return (
    <>
      {Array.from({ length: props.days }).map((_, count) => {
        const day = addDays(props.start, count)
        return (
          <div className="relative basis-0 grow" key={count}>
            {Array.from({ length: props.hours }).map((_, count) => (
              <div
                className="border-b border-l border-black/15 h-12 dark:border-white/15"
                key={count}
              />
            ))}

            {isToday(day) && <CurrentHourMarker />}
          </div>
        )
      })}
    </>
  )
}
