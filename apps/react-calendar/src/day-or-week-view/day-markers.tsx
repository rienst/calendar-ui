import classNames from 'classnames'
import { Day, format, isToday, Locale } from 'date-fns'

export interface DayMarkersProps {
  days: Date[]
  weekStartsOn: Day
  locale?: Locale
  onSelectDay?: (date: Date) => void
}

export function DayMarkers(props: DayMarkersProps) {
  return (
    <div className="flex pl-20">
      {props.days.map(date => (
        <div
          key={date.toISOString()}
          className="overflow-hidden basis-0 grow py-2 flex items-center justify-center"
        >
          <button
            onClick={() => props.onSelectDay?.(date)}
            className={classNames(
              'truncate text-center text-lg font-medium px-3 rounded-lg cursor-pointer',
              isToday(date)
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'hover:bg-neutral-500/25'
            )}
          >
            {format(date, 'EEEEEE d', { locale: props.locale })}
          </button>
        </div>
      ))}
    </div>
  )
}
