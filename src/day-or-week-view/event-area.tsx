import { isWithinInterval, Locale } from 'date-fns'
import { CurrentHourMarker } from './current-hour-marker'
import { Event } from '.'
import { Arranger } from '../arranger'
import { createContext, useContext, useMemo, useState } from 'react'
import { useResizeObserver } from '../hooks/use-element-size'
import { DraggableEventView } from './draggable-event-view'

export interface EventAreaProps {
  start: Date
  days: number
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

export interface EventAreaContextValue {
  pxPerMinute: number
  getBlocksForEvent: (options: {
    start: Date
    end: Date
    column: number
    columns: number
  }) => EventPosition[] | null
  getDatesForDraggingEvent: (options: {
    mouseWindowOffsetXPx: number
    eventWindowOffsetYPx: number
    eventLengthMinutes: number
  }) => { start: Date; end: Date } | null
  getDatesForResizingEvent: (options: {
    mouseWindowOffsetXPx: number
    eventEndWindowOffsetYPx: number
    eventStart: Date
  }) => { start: Date; end: Date } | null
}

const eventAreaContext = createContext<EventAreaContextValue | null>(null)

export function EventArea(props: EventAreaProps) {
  const EVENT_TRACK_SIZE_MINUTES = 60 * 24
  const EVENT_TRACK_PADDING_RIGHT_PX = 12
  const EVENT_PADDING_PX = 2
  const EVENT_SNAP_MINUTES = 15
  const MIN_DRAG_RESIZE_MINUTES = 30

  const areaSizeInMinutes = props.days * EVENT_TRACK_SIZE_MINUTES

  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(
    null
  )

  const wrapperResizeObserverEntry = useResizeObserver(wrapperElement)

  const areaStartMinutes = Math.round(props.start.getTime() / 1000 / 60)

  function getBlocksForEvent({
    start,
    end,
    column,
    columns,
  }: {
    start: Date
    end: Date
    column: number
    columns: number
  }): EventPosition[] | null {
    if (!wrapperResizeObserverEntry) {
      return null
    }

    const eventStartMinutes = Math.round(start.getTime() / 1000 / 60)
    const eventEndMinutes = Math.round(end.getTime() / 1000 / 60)

    if (
      eventEndMinutes < areaStartMinutes ||
      eventStartMinutes > areaStartMinutes + areaSizeInMinutes
    ) {
      return null
    }

    const blocks: {
      start: Date
      end: Date
      column: number
      columns: number
    }[] = Array.from({ length: props.days }, (_, index) => {
      const day = index
      const dayStart = new Date(
        props.start.getTime() + day * EVENT_TRACK_SIZE_MINUTES * 60 * 1000
      )
      const dayEnd = new Date(
        dayStart.getTime() + EVENT_TRACK_SIZE_MINUTES * 60 * 1000
      )

      return {
        start: new Date(Math.max(dayStart.getTime(), start.getTime())),
        end: new Date(Math.min(dayEnd.getTime(), end.getTime())),
        column,
        columns,
      }
    })
    .filter(block => block.start < block.end)

    return blocks
      .map(block => getPositionForBlock(block))
      .filter((block): block is EventPosition => block !== null)
  }
  function getPositionForBlock({
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

    const eventStartMinutes = Math.round(start.getTime() / 1000 / 60)
    const eventEndMinutes = Math.round(end.getTime() / 1000 / 60)

    if (
      eventEndMinutes < areaStartMinutes ||
      eventStartMinutes > areaStartMinutes + areaSizeInMinutes
    ) {
      return null
    }

    const eventTrackOffsetMinutes = eventStartMinutes - areaStartMinutes
    const eventTop =
      ((eventTrackOffsetMinutes / EVENT_TRACK_SIZE_MINUTES) *
        wrapperResizeObserverEntry.contentRect.height) %
      wrapperResizeObserverEntry.contentRect.height

    const top = Math.max(0, eventTop)
    const invisibleTop = top - eventTop

    const eventLengthMinutes = eventEndMinutes - eventStartMinutes
    const eventHeight =
      (eventLengthMinutes / EVENT_TRACK_SIZE_MINUTES) *
        wrapperResizeObserverEntry.contentRect.height -
      EVENT_PADDING_PX

    const height = Math.max(
      0,
      Math.min(
        eventHeight - invisibleTop,
        wrapperResizeObserverEntry.contentRect.height - top
      )
    )

    const day = Math.floor(eventTrackOffsetMinutes / EVENT_TRACK_SIZE_MINUTES)
    const trackWidthPx =
      wrapperResizeObserverEntry.contentRect.width / props.days
    const trackWidthWithPaddingPx = trackWidthPx - EVENT_TRACK_PADDING_RIGHT_PX
    const left =
      day * trackWidthPx + ((column - 1) * trackWidthWithPaddingPx) / columns

    const width = trackWidthWithPaddingPx / columns - EVENT_PADDING_PX

    return {
      top,
      left,
      height,
      width,
    }
  }

  function getDatesForDraggingEvent({
    mouseWindowOffsetXPx,
    eventWindowOffsetYPx,
    eventLengthMinutes,
  }: {
    mouseWindowOffsetXPx: number
    eventWindowOffsetYPx: number
    eventLengthMinutes: number
  }): { start: Date; end: Date } | null {
    if (!wrapperResizeObserverEntry) {
      return null
    }

    const eventTrackOffsetXPx =
      mouseWindowOffsetXPx -
      wrapperResizeObserverEntry.target.getBoundingClientRect().left

    const track = Math.min(
      Math.max(
        Math.floor(
          (eventTrackOffsetXPx / wrapperResizeObserverEntry.contentRect.width) *
            props.days
        ),
        0
      ),
      props.days - 1
    )

    const trackStartMinutes = track * EVENT_TRACK_SIZE_MINUTES

    const eventTrackOffsetYPx =
      eventWindowOffsetYPx -
      wrapperResizeObserverEntry.target.getBoundingClientRect().top
    const eventTrackOffsetYMinutes =
      (eventTrackOffsetYPx / wrapperResizeObserverEntry.contentRect.height) *
      EVENT_TRACK_SIZE_MINUTES

    const startMinutes =
      Math.round(
        (areaStartMinutes + eventTrackOffsetYMinutes) / EVENT_SNAP_MINUTES
      ) *
        EVENT_SNAP_MINUTES +
      trackStartMinutes

    const maxStartMinutes =
      Math.round(props.start.getTime() / 1000 / 60) +
      areaSizeInMinutes -
      MIN_DRAG_RESIZE_MINUTES

    const startMinutesClamped = Math.min(
      Math.max(startMinutes, areaStartMinutes),
      maxStartMinutes
    )

    const endMinutes = startMinutesClamped + eventLengthMinutes

    return {
      start: new Date(startMinutesClamped * 60 * 1000),
      end: new Date(endMinutes * 60 * 1000),
    }
  }

  function getDatesForResizingEvent({
    mouseWindowOffsetXPx,
    eventEndWindowOffsetYPx,
    eventStart,
  }: {
    mouseWindowOffsetXPx: number
    eventEndWindowOffsetYPx: number
    eventStart: Date
  }) {
    if (!wrapperResizeObserverEntry) {
      return null
    }

    const eventTrackOffsetXPx =
      mouseWindowOffsetXPx -
      wrapperResizeObserverEntry.target.getBoundingClientRect().left

    const track = Math.min(
      Math.max(
        Math.floor(
          (eventTrackOffsetXPx / wrapperResizeObserverEntry.contentRect.width) *
            props.days
        ),
        0
      ),
      props.days - 1
    )
    const trackStartMinutes = track * EVENT_TRACK_SIZE_MINUTES

    const eventEndTrackOffsetYPx =
      eventEndWindowOffsetYPx -
      wrapperResizeObserverEntry.target.getBoundingClientRect().top

    const eventEndTrackOffsetYMinutes =
      (eventEndTrackOffsetYPx / wrapperResizeObserverEntry.contentRect.height) *
        EVENT_TRACK_SIZE_MINUTES +
      trackStartMinutes

    const endMinutes =
      Math.round(
        (areaStartMinutes + eventEndTrackOffsetYMinutes) / EVENT_SNAP_MINUTES
      ) * EVENT_SNAP_MINUTES

    const startMinutes = Math.round(eventStart.getTime() / 1000 / 60)

    const endMinutesClamped = Math.max(
      startMinutes + MIN_DRAG_RESIZE_MINUTES,
      Math.min(endMinutes, areaStartMinutes + areaSizeInMinutes)
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
    <div ref={setWrapperElement} className="relative flex w-full">
      {!!wrapperResizeObserverEntry && (
        <>
          <eventAreaContext.Provider
            value={{
              pxPerMinute:
                wrapperResizeObserverEntry.contentRect.height /
                EVENT_TRACK_SIZE_MINUTES,
              getBlocksForEvent,
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
                  eventEndMinutes >= areaStartMinutes &&
                  arrangeStartMinutes <= areaStartMinutes + areaSizeInMinutes
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
          </eventAreaContext.Provider>

          {Array.from({ length: props.days }).map((_, count) => (
            <div className="basis-0 grow" key={count}>
              {Array.from({ length: 24 }).map((_, count) => (
                <div
                  className="border-b border-l border-black/15 h-12 dark:border-white/15"
                  key={count}
                />
              ))}
            </div>
          ))}
        </>
      )}

      {isWithinInterval(new Date(), {
        start: props.start,
        end: new Date(
          props.start.getTime() + EVENT_TRACK_SIZE_MINUTES * 60 * 1000
        ),
      }) && <CurrentHourMarker />}
    </div>
  )
}

export function useEventArea() {
  const value = useContext(eventAreaContext)

  if (!value) {
    return {
      pxPerMinute: 1,
      getBlocksForEvent: () => null,
      getDatesForDraggingEvent: () => null,
      getDatesForResizingEvent: () => null,
    } satisfies EventAreaContextValue
  }

  return value
}
