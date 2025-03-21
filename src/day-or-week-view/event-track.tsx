import { isWithinInterval, Locale } from 'date-fns'
import { CurrentHourMarker } from './current-hour-marker'
import { Event } from '.'
import { Arranger } from '../arranger'
import { createContext, useContext, useMemo, useState } from 'react'
import { useResizeObserver } from '../hooks/use-element-size'
import { DraggableEventView } from './draggable-event-view'

export interface EventTrackProps {
  start: Date
  sizeInMinutes: number
  events?: Event[]
  locale?: Locale
  onEventsChange?: (events: Event[]) => void
}

export interface EventPosition {
  top: number
  left: number
  height: number
  width: number
}

export interface EventTrackContextValue {
  pxPerMinute: number
  getPositionForEvent: (options: {
    start: Date
    end: Date
    column: number
    columns: number
  }) => EventPosition | null
  getDatesForDraggingEvent: (options: {
    eventWindowOffsetYPx: number
    eventLengthMinutes: number
  }) => { start: Date; end: Date } | null
  getDatesForResizingEvent: (options: {
    eventEndWindowOffsetYPx: number
    eventStart: Date
  }) => { start: Date; end: Date } | null
}

const eventTrackContext = createContext<EventTrackContextValue | null>(null)

export function EventTrack(props: EventTrackProps) {
  const EVENT_TRACK_PADDING_RIGHT_PX = 12
  const EVENT_PADDING_PX = 2
  const EVENT_SNAP_MINUTES = 15
  const MIN_RESIZE_MINUTES = 30

  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(
    null
  )

  const wrapperResizeObserverEntry = useResizeObserver(wrapperElement)

  const trackStartMinutes = Math.round(props.start.getTime() / 1000 / 60)

  function getPositionForEvent({
    start,
    end,
    column,
    columns,
  }: {
    start: Date
    end: Date
    column: number
    columns: number
  }): EventPosition | null {
    if (!wrapperResizeObserverEntry) {
      return null
    }

    const trackWidthPx =
      wrapperResizeObserverEntry.contentRect.width -
      EVENT_TRACK_PADDING_RIGHT_PX

    const eventStartMinutes = Math.round(start.getTime() / 1000 / 60)
    const eventEndMinutes = Math.round(end.getTime() / 1000 / 60)

    if (
      eventEndMinutes < trackStartMinutes ||
      eventStartMinutes > trackStartMinutes + props.sizeInMinutes
    ) {
      return null
    }

    const startOffsetToTrackMinutes = eventStartMinutes - trackStartMinutes
    const startOffsetToTrackPx =
      (startOffsetToTrackMinutes / props.sizeInMinutes) *
      wrapperResizeObserverEntry.contentRect.height

    const eventLengthMinutes = eventEndMinutes - eventStartMinutes
    const eventLengthPx =
      (eventLengthMinutes / props.sizeInMinutes) *
        wrapperResizeObserverEntry.contentRect.height -
      EVENT_PADDING_PX

    const width = trackWidthPx / columns - EVENT_PADDING_PX
    const left = ((column - 1) * trackWidthPx) / columns

    return {
      top: startOffsetToTrackPx,
      left,
      height: eventLengthPx,
      width,
    }
  }

  function getDatesForDraggingEvent({
    eventWindowOffsetYPx,
    eventLengthMinutes,
  }: {
    eventWindowOffsetYPx: number
    eventLengthMinutes: number
  }): { start: Date; end: Date } | null {
    if (!wrapperResizeObserverEntry) {
      return null
    }

    const eventTrackOffsetYPx =
      eventWindowOffsetYPx -
      wrapperResizeObserverEntry.target.getBoundingClientRect().top
    const eventTrackOffsetYMinutes =
      (eventTrackOffsetYPx / wrapperResizeObserverEntry.contentRect.height) *
      props.sizeInMinutes

    const startMinutes =
      Math.round(
        (trackStartMinutes + eventTrackOffsetYMinutes) / EVENT_SNAP_MINUTES
      ) * EVENT_SNAP_MINUTES

    const maxStartMinutes =
      Math.round(props.start.getTime() / 1000 / 60) +
      props.sizeInMinutes -
      eventLengthMinutes

    const startMinutesClamped = Math.min(
      Math.max(startMinutes, trackStartMinutes),
      maxStartMinutes
    )

    const endMinutes = startMinutesClamped + eventLengthMinutes

    return {
      start: new Date(startMinutesClamped * 60 * 1000),
      end: new Date(endMinutes * 60 * 1000),
    }
  }

  function getDatesForResizingEvent({
    eventEndWindowOffsetYPx,
    eventStart,
  }: {
    eventEndWindowOffsetYPx: number
    eventStart: Date
  }) {
    if (!wrapperResizeObserverEntry) {
      return null
    }

    const eventEndTrackOffsetYPx =
      eventEndWindowOffsetYPx -
      wrapperResizeObserverEntry.target.getBoundingClientRect().top

    const eventEndTrackOffsetYMinutes =
      (eventEndTrackOffsetYPx / wrapperResizeObserverEntry.contentRect.height) *
      props.sizeInMinutes

    const endMinutes =
      Math.round(
        (trackStartMinutes + eventEndTrackOffsetYMinutes) / EVENT_SNAP_MINUTES
      ) * EVENT_SNAP_MINUTES

    const startMinutes = Math.round(eventStart.getTime() / 1000 / 60)

    const endMinutesClamped = Math.max(
      startMinutes + MIN_RESIZE_MINUTES,
      Math.min(endMinutes, trackStartMinutes + props.sizeInMinutes)
    )

    return {
      start: new Date(startMinutes * 60 * 1000),
      end: new Date(endMinutesClamped * 60 * 1000),
    }
  }

  const arrangedEvents = useMemo(
    () => Arranger.arrange(props.events || []),
    [props.events]
  )

  function handleEventChanged(eventId: string, start: Date, end: Date) {
    if (!props.onEventsChange) {
      return
    }

    props.onEventsChange(
      props.events?.map(event =>
        event.id === eventId ? { ...event, start, end } : event
      ) || []
    )
  }

  return (
    <div className="relative basis-0 grow">
      <div ref={setWrapperElement}>
        {!!wrapperResizeObserverEntry && (
          <>
            <eventTrackContext.Provider
              value={{
                pxPerMinute:
                  wrapperResizeObserverEntry.contentRect.height /
                  props.sizeInMinutes,
                getPositionForEvent,
                getDatesForDraggingEvent,
                getDatesForResizingEvent,
              }}
            >
              {arrangedEvents
                .filter(arrangeResult => {
                  const arrangeStartMinutes = Math.round(
                    arrangeResult.item.start.getTime() / 1000 / 60
                  )
                  const eventEndMinutes = Math.round(
                    arrangeResult.item.end.getTime() / 1000 / 60
                  )

                  return (
                    eventEndMinutes >= trackStartMinutes &&
                    arrangeStartMinutes <=
                      trackStartMinutes + props.sizeInMinutes
                  )
                })
                .map(arrangeResult => (
                  <DraggableEventView
                    key={arrangeResult.item.id}
                    id={arrangeResult.item.id}
                    title={arrangeResult.item.title}
                    start={arrangeResult.item.start}
                    end={arrangeResult.item.end}
                    column={arrangeResult.column}
                    columns={arrangeResult.columns}
                    locale={props.locale}
                    onStartEndChanged={(start, end) =>
                      handleEventChanged(arrangeResult.item.id, start, end)
                    }
                  />
                ))}
            </eventTrackContext.Provider>

            {Array.from({ length: 24 }).map((_, count) => (
              <div
                className="border-b border-l border-black/15 h-12 dark:border-white/15"
                key={count}
              />
            ))}
          </>
        )}
      </div>

      {isWithinInterval(new Date(), {
        start: props.start,
        end: new Date(props.start.getTime() + props.sizeInMinutes * 60 * 1000),
      }) && <CurrentHourMarker />}
    </div>
  )
}

export function useEventTrack() {
  const value = useContext(eventTrackContext)

  if (!value) {
    return {
      pxPerMinute: 1,
      getPositionForEvent: () => null,
      getDatesForDraggingEvent: () => null,
      getDatesForResizingEvent: () => null,
    } satisfies EventTrackContextValue
  }

  return value
}
