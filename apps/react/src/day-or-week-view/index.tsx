import {
  addDays,
  Day,
  eachDayOfInterval,
  endOfWeek,
  format,
  Locale,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { HasStartAndEndDate } from '@calendar-ui/core'
import { HourMarkers } from './hour-markers'
import { DayMarkers } from './day-markers'
import { Tabs } from './tabs'
import { ArrowButtons } from './arrow-buttons'
import { Button } from './button'
import { EventAreaView } from './event-area-view'

export type DayOrWeekViewType = 'week' | 'day'

export interface DayOrWeekViewProps {
  viewingDate: Date | number
  weekStartsOn?: Day
  locale?: Locale
  events?: Event[]
  view?: DayOrWeekViewType
  selectedEventId?: string
  onEventSelected?: (id?: string) => void
  onChangeViewingDate?: (date: Date) => void
  onChangeView?: (view: DayOrWeekViewType) => void
  onEventsChange?: (events: Event[]) => void
  onEventSketched?: (sketch: HasStartAndEndDate) => void
}

export interface Event {
  id: string
  title?: string
  start: Date
  end: Date
}

export function DayOrWeekView(props: DayOrWeekViewProps) {
  const view = props.view ?? 'week'

  const weekStartsOn = props.weekStartsOn ?? 0

  const trackStartingDates =
    view === 'week'
      ? eachDayOfInterval({
          start: startOfWeek(props.viewingDate, { weekStartsOn }),
          end: startOfDay(endOfWeek(props.viewingDate, { weekStartsOn })),
        })
      : [startOfDay(props.viewingDate)]

  function handleSelectDay(date: Date) {
    props.onChangeViewingDate?.(date)
    props.onChangeView?.('day')
  }

  function handleChangeView(view: DayOrWeekViewType) {
    props.onChangeView?.(view)
  }

  function handleTodayButtonClick() {
    props.onChangeViewingDate?.(new Date())
  }

  function handlePreviousArrowClick() {
    const newViewingDate = addDays(props.viewingDate, view === 'day' ? -1 : -7)
    props.onChangeViewingDate?.(newViewingDate)
  }

  function handleNextArrowClick() {
    const newViewingDate = addDays(props.viewingDate, view === 'day' ? 1 : 7)
    props.onChangeViewingDate?.(newViewingDate)
  }

  return (
    <div>
      <div className="sticky top-0 z-40 bg-white/85 border-b border-black/15 dark:bg-neutral-900/85 dark:border-white/15 backdrop-blur-xl">
        <div className="flex items-center justify-between pl-4 py-2 pr-2 sm:p-4">
          <div className="flex gap-2 sm:gap-4 items-center justify-between sm:justify-start w-full">
            <div className="flex gap-2 sm:gap-4 items-center order-2 sm:order-1">
              <Button onClick={handleTodayButtonClick}>Today</Button>

              <ArrowButtons
                onClickPrevious={handlePreviousArrowClick}
                onClickNext={handleNextArrowClick}
              />
            </div>

            <h1 className="font-semibold sm:text-2xl order-1 sm:order-2">
              {format(
                trackStartingDates[0],
                view === 'week' ? 'MMMM yyyy' : 'EEEEEE d MMMM yyyy',
                { locale: props.locale }
              )}
            </h1>
          </div>

          <div className="hidden sm:block">
            <Tabs
              options={[
                { label: 'Day', value: 'day' },
                { label: 'Week', value: 'week' },
              ]}
              value={view}
              onChange={handleChangeView}
            />
          </div>
        </div>
        {view === 'week' && (
          <div className="border-t border-black/15 dark:border-white/15">
            <DayMarkers
              days={trackStartingDates}
              weekStartsOn={weekStartsOn}
              locale={props.locale}
              onSelectDay={handleSelectDay}
            />
          </div>
        )}
      </div>

      <div className="flex items-end">
        <HourMarkers date={trackStartingDates[0]} locale={props.locale} />

        <EventAreaView
          start={trackStartingDates[0]}
          days={view === 'week' ? 7 : 1}
          events={props.events}
          dayPaddingRight={12}
          blockPadding={2}
          dragIntervalMs={15 * 60 * 1000}
          minEventSizeMs={30 * 60 * 1000}
          selectedEventId={props.selectedEventId}
          locale={props.locale}
          onEventSelected={props.onEventSelected}
          onEventsChange={props.onEventsChange}
          onEventSketched={props.onEventSketched}
        />
      </div>
    </div>
  )
}
