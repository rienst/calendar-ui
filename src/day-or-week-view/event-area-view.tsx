import { Locale } from 'date-fns'
import { Event } from '.'
import { useMemo, useState } from 'react'
import { EventAreaGrid } from './event-area-grid'
import { EventArea } from './event-area'
import { useResizeObserver } from '../hooks/use-resize-observer'
import { Arranger } from '../arranger'
import { EventViewWithDragObserver } from './event-view-with-drag-observer'
import {
  DraggingCanvas,
  DraggingEventState,
  DraggingEventUpdate,
} from './dragging-event-update'

export interface EventAreaViewProps {
  start: Date
  days: number
  events?: Event[]
  dayPaddingRight?: number
  blockPadding?: number
  dragIntervalMs?: number
  minEventSizeMs?: number
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
  minEventSizeMs,
  locale,
  onEventsChange,
}: EventAreaViewProps) {
  const [draggingEventState, setDraggingEventState] =
    useState<DraggingEventState>()
  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(
    null
  )
  const wrapperResizeObserverEntry = useResizeObserver(wrapperElement)

  const eventArea = useMemo(() => {
    if (!wrapperResizeObserverEntry) {
      return
    }

    const eventArea = new EventArea(
      {
        start,
        days,
        width: wrapperResizeObserverEntry.contentRect.width,
        height: wrapperResizeObserverEntry.contentRect.height,
        top: wrapperResizeObserverEntry.target.getBoundingClientRect().top,
        left: wrapperResizeObserverEntry.target.getBoundingClientRect().left,
        blockPadding,
        dayPaddingRight,
        events,
      },
      new Arranger()
    )

    const draggingCanvas: DraggingCanvas = {
      getDateForPosition: eventArea.getDateForPosition.bind(eventArea),
    }

    if (draggingEventState) {
      eventArea.update = new DraggingEventUpdate(
        draggingEventState,
        draggingCanvas,
        { dragIntervalMs, minEventSizeMs }
      )
    }

    return eventArea
  }, [
    wrapperResizeObserverEntry,
    start,
    days,
    events,
    dayPaddingRight,
    blockPadding,
    dragIntervalMs,
    draggingEventState,
  ])

  return (
    <div ref={setWrapperElement} className="relative flex w-full">
      {eventArea?.getEventBlocks().map(block => (
        <EventViewWithDragObserver
          key={block.key}
          title={block.event.title}
          start={block.event.start}
          end={block.event.end}
          top={block.top}
          left={block.left}
          height={block.height}
          width={block.width}
          locale={locale}
          isFloating={block.isUpdate}
          isTransparent={block.isBeingUpdated}
          isMovable={!block.isUpdate}
          isResizable
          onDragStateChange={dragState =>
            setDraggingEventState(
              dragState && {
                behavior: dragState.behavior,
                eventId: block.event.id,
                eventEnd: block.event.end,
                eventDurationMs:
                  block.event.end.getTime() - block.event.start.getTime(),
                initialEventLeft: dragState.initialEventLeft,
                initialEventBottom: dragState.initialEventTop,
                eventLeft: dragState.eventLeft,
                eventBottom: dragState.eventTop,
              }
            )
          }
          onDragConfirm={() => {
            if (
              !draggingEventState ||
              !eventArea ||
              !wrapperResizeObserverEntry
            ) {
              return
            }

            const draggingCanvas: DraggingCanvas = {
              getDateForPosition: eventArea.getDateForPosition.bind(eventArea),
            }

            const draggingEvent = new DraggingEventUpdate(
              draggingEventState,
              draggingCanvas,
              { dragIntervalMs, minEventSizeMs }
            )

            const updatedEvents = (events || []).map(event => {
              if (event.id === draggingEventState.eventId) {
                return {
                  ...event,
                  start: draggingEvent.start,
                  end: draggingEvent.end,
                }
              }

              return event
            })

            onEventsChange?.(updatedEvents)
          }}
        />
      ))}

      <EventAreaGrid days={days} hours={24} />
    </div>
  )
}
