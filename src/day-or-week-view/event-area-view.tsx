import { Locale } from 'date-fns'
import { Event } from '.'
import { useMemo, useState } from 'react'
import { EventAreaGrid } from './event-area-grid'
import { EventArea, EventUpdate } from './event-area'
import { useResizeObserver } from '../hooks/use-resize-observer'
import { EventView } from './event-view'
import { Arranger } from '../arranger'
import { useEventDragObserver } from '../hooks/use-event-drag-observer'
import { useInvisibleDragHandlers } from '../hooks/use-invisible-drag-handlers'

export interface EventAreaViewProps {
  start: Date
  days: number
  events?: Event[]
  dayPaddingRight?: number
  blockPadding?: number
  eventSnapMinutes?: number
  dragIntervalMs?: number
  locale?: Locale
  onEventsChange?: (events: Event[]) => void
}

export function EventAreaView({
  start,
  days,
  events,
  dayPaddingRight,
  blockPadding,
  dragIntervalMs,
  locale,
  onEventsChange,
}: EventAreaViewProps) {
  const [eventUpdate, setEventUpdate] = useState<EventUpdate>()
  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(
    null
  )
  const wrapperResizeObserverEntry = useResizeObserver(wrapperElement)

  const eventArea = useMemo(() => {
    if (!wrapperResizeObserverEntry) {
      return
    }

    return new EventArea(
      {
        start,
        days,
        width: wrapperResizeObserverEntry.contentRect.width,
        height: wrapperResizeObserverEntry.contentRect.height,
        blockPadding,
        dayPaddingRight,
        events,
        update: eventUpdate,
      },
      new Arranger()
    )
  }, [
    wrapperResizeObserverEntry,
    start,
    days,
    events,
    dayPaddingRight,
    blockPadding,
    eventUpdate,
  ])

  const eventDragObserver = useEventDragObserver({
    dragIntervalMs,
    wrapperTop:
      wrapperResizeObserverEntry?.target.getBoundingClientRect().top || 0,
    wrapperLeft:
      wrapperResizeObserverEntry?.target.getBoundingClientRect().left || 0,
    positionToDateConverter: eventArea,
    onDragConfirm: state => {
      const newEvents = events?.map(event => {
        if (event.id === state.eventId) {
          const eventDurationMs = event.end.getTime() - event.start.getTime()
          const end = new Date(state.start.getTime() + eventDurationMs)

          return {
            ...event,
            start: state.start,
            end,
          }
        }

        return event
      })

      onEventsChange?.(newEvents || [])
    },
    onStateChange: state => {
      if (!state) {
        setEventUpdate(undefined)
        return
      }

      const event = (events || []).find(event => event.id === state.eventId)

      if (!event) {
        return
      }

      const eventDurationMs = event.end.getTime() - event.start.getTime()
      const end = new Date(state.start.getTime() + eventDurationMs)

      setEventUpdate({
        eventId: state.eventId,
        start: state.start,
        end,
        type: 'drag',
      })
    },
  })

  const invisibleDragHandlers = useInvisibleDragHandlers({
    onDragStart: eventDragObserver.onDragStart,
    onDragEnd: eventDragObserver.onDragEnd,
  })

  return (
    <div ref={setWrapperElement} className="relative flex w-full">
      {eventArea?.getEventBlocks().map(block => (
        <EventView
          key={block.key}
          title={block.event.title}
          start={block.event.start}
          end={block.event.end}
          top={block.top}
          left={block.left}
          height={block.height}
          width={block.width}
          locale={locale}
          isFloating={block.isFloating}
          isTransparent={block.isTransparent}
          isDraggable
          onDrag={dragEvent =>
            eventDragObserver.onDrag(block.event.id, dragEvent)
          }
          onDragStart={invisibleDragHandlers.onDragStart}
          onDragEnd={invisibleDragHandlers.onDragEnd}
        />
      ))}

      <EventAreaGrid days={days} hours={24} />
    </div>
  )
}
