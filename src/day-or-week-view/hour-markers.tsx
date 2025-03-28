import {
  eachHourOfInterval,
  endOfDay,
  format,
  Locale,
  startOfDay,
} from 'date-fns'

export interface HourMarkersProps {
  date: Date | number
  locale?: Locale
}

export function HourMarkers(props: HourMarkersProps) {
  const hours = eachHourOfInterval({
    start: startOfDay(props.date),
    end: endOfDay(props.date),
  })

  return (
    <div>
      {hours.slice(1).map(hour => (
        <div
          className="relative text-xs tabular-nums text-neutral-600 h-12 w-20 text-right dark:text-neutral-300"
          key={hour.toISOString()}
        >
          <div className="absolute -top-2 right-0 px-2">
            {format(hour, 'p', { locale: props.locale })}
          </div>
        </div>
      ))}
    </div>
  )
}
