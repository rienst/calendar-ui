import { isWithinInterval, Locale } from 'date-fns'
import { CurrentHourMarker } from './current-hour-marker'
import { Event } from '.'
import { Arranger } from '../arranger'
import { DragEvent, useCallback, useMemo, useState } from 'react'
import { useResizeObserver } from '../hooks/use-element-size'
import { EventView } from './event-view'
import { useInvisibleDragHandlers } from '../hooks/use-invisible-drag-handlers'

export interface EventAreaProps {
  start: Date
  days: number
  events?: Event[]
  locale?: Locale
  onEventsChange?: (events: Event[]) => void
}

export interface EventBlock {
  event: Event
  start: Date
  end: Date
  key: string
  top: number
  left: number
  height: number
  width: number
  isUpdating: boolean
  isTransparent: boolean
  isResizable: boolean
}

export type EventUpdateType = 'drag' | 'resize'

export interface EventUpdate {
  id: string
  start: Date
  end: Date
  type: EventUpdateType
}

export interface DraggingState {
  initialEventBlock: EventBlock
  initialMouseEventOffsetY: number
  clientX: number
  clientY: number
  updateType: 'drag'
}

export interface ResizingState {
  initialEventBlock: EventBlock
  initialMouseEventBottomOffsetY: number
  clientX: number
  clientY: number
  updateType: 'resize'
}

type UpdatingState = DraggingState | ResizingState

export function EventArea(props: EventAreaProps) {
  const EVENT_TRACK_SIZE_MINUTES = 60 * 24
  const EVENT_TRACK_PADDING_RIGHT_PX = 12
  const EVENT_PADDING_PX = 2
  const EVENT_SNAP_MINUTES = 15
  const MIN_DRAG_RESIZE_MINUTES = 30

  const areaStartMinutes = Math.round(props.start.getTime() / 1000 / 60)
  const areaSizeInMinutes = props.days * EVENT_TRACK_SIZE_MINUTES

  const [updatingState, setUpdatingState] = useState<UpdatingState | null>(null)

  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(
    null
  )
  const wrapperResizeObserverEntry = useResizeObserver(wrapperElement)

  function handleUpdate(
    eventBlock: EventBlock,
    dragEvent: DragEvent,
    type: EventUpdateType
  ) {
    dragEvent.stopPropagation()

    if (dragEvent.clientX === 0 && dragEvent.clientY === 0) {
      setUpdatingState(null)

      if (!updatingEvent) {
        return
      }

      const updateEvent = props.events?.find(e => e.id === updatingEvent.id)

      if (!updateEvent) {
        return
      }

      const updatedEvents = props.events?.map(event => {
        if (event.id === updatingEvent.id) {
          return {
            ...event,
            start: updatingEvent.start,
            end: updatingEvent.end,
          }
        }

        return event
      })

      props.onEventsChange?.(updatedEvents || [])

      return
    }

    if (type === 'resize') {
      setUpdatingState({
        initialEventBlock:
          updatingState?.initialEventBlock.event.id === eventBlock.event.id
            ? updatingState.initialEventBlock
            : eventBlock,
        updateType: type,
        initialMouseEventBottomOffsetY:
          updatingState?.updateType === 'resize' &&
          updatingState?.initialEventBlock.event.id === eventBlock.event.id
            ? updatingState.initialMouseEventBottomOffsetY
            : dragEvent.clientY -
              dragEvent.currentTarget.getBoundingClientRect().bottom,
        clientX: dragEvent.clientX,
        clientY: dragEvent.clientY,
      })
      return
    }

    setUpdatingState({
      initialEventBlock:
        updatingState?.initialEventBlock.event.id === eventBlock.event.id
          ? updatingState.initialEventBlock
          : eventBlock,
      updateType: type,
      initialMouseEventOffsetY:
        updatingState?.updateType === 'drag' &&
        updatingState?.initialEventBlock.event.id === eventBlock.event.id
          ? updatingState.initialMouseEventOffsetY
          : dragEvent.clientY -
            dragEvent.currentTarget.getBoundingClientRect().top,
      clientX: dragEvent.clientX,
      clientY: dragEvent.clientY,
    })
  }

  const updatingEvent = useMemo<EventUpdate | null>(() => {
    if (!updatingState) {
      return null
    }

    const event = props.events?.find(
      e => e.id === updatingState.initialEventBlock.event.id
    )

    if (!event) {
      return null
    }

    if (!wrapperResizeObserverEntry) {
      return null
    }

    const mouseWindowOffsetXPx = updatingState.clientX

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

    const blockOffsetToEventStartMinutes =
      (updatingState.initialEventBlock.event.start.getTime() -
        updatingState.initialEventBlock.start.getTime()) /
      1000 /
      60

    if (updatingState.updateType === 'drag') {
      const eventLengthMinutes =
        event.end.getTime() / 1000 / 60 - event.start.getTime() / 1000 / 60

      const eventWindowOffsetYPx =
        updatingState.clientY - updatingState.initialMouseEventOffsetY

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
        trackStartMinutes +
        blockOffsetToEventStartMinutes

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
        id: updatingState.initialEventBlock.event.id,
        start: new Date(startMinutesClamped * 60 * 1000),
        end: new Date(endMinutes * 60 * 1000),
        type: 'drag',
      }
    }

    const eventBottomWindowOffsetYPx =
      updatingState.clientY - updatingState.initialMouseEventBottomOffsetY

    const eventBottomTrackOffsetYPx =
      eventBottomWindowOffsetYPx -
      wrapperResizeObserverEntry.target.getBoundingClientRect().top

    const eventBottomTrackOffsetYMinutes =
      (eventBottomTrackOffsetYPx /
        wrapperResizeObserverEntry.contentRect.height) *
      EVENT_TRACK_SIZE_MINUTES

    const startMinutes =
      updatingState.initialEventBlock.event.start.getTime() / 1000 / 60

    const endMinutes =
      Math.round(
        (areaStartMinutes + eventBottomTrackOffsetYMinutes) / EVENT_SNAP_MINUTES
      ) *
        EVENT_SNAP_MINUTES +
      trackStartMinutes +
      blockOffsetToEventStartMinutes

    console.log(new Date(endMinutes * 60 * 1000).toISOString())

    const minEndMinutes = startMinutes + MIN_DRAG_RESIZE_MINUTES

    const endMinutesClamped = Math.max(
      Math.max(endMinutes, areaStartMinutes),
      minEndMinutes
    )

    return {
      id: updatingState.initialEventBlock.event.id,
      start: new Date(startMinutes * 60 * 1000),
      end: new Date(endMinutesClamped * 60 * 1000),
      type: 'resize',
    }
  }, [
    EVENT_TRACK_SIZE_MINUTES,
    areaSizeInMinutes,
    areaStartMinutes,
    updatingState,
    props.days,
    props.start,
    wrapperResizeObserverEntry,
    props.events,
  ])

  function handleDragEnd(event: DragEvent) {
    event.stopPropagation()
    setUpdatingState(null)
  }

  const { onDragStart, onDragEnd } = useInvisibleDragHandlers({
    onDragStart: e => e.stopPropagation(),
    onDragEnd: handleDragEnd,
  })

  const getPositionForEvent = useCallback(
    ({
      start,
      end,
      column,
      columns,
    }: {
      start: Date
      end: Date
      column: number
      columns: number
    }) => {
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
      const trackWidthWithPaddingPx =
        trackWidthPx - EVENT_TRACK_PADDING_RIGHT_PX
      const left =
        day * trackWidthPx + ((column - 1) * trackWidthWithPaddingPx) / columns

      const width = trackWidthWithPaddingPx / columns - EVENT_PADDING_PX

      return {
        top,
        left,
        height,
        width,
      }
    },
    [
      props.days,
      EVENT_TRACK_SIZE_MINUTES,
      areaSizeInMinutes,
      areaStartMinutes,
      wrapperResizeObserverEntry,
    ]
  )

  const eventBlocks: EventBlock[] = useMemo(() => {
    const eventsWithUpdatesPerTrack =
      (props.events || [])
        .map(event => {
          const eventUpdate =
            updatingEvent?.id === event.id ? updatingEvent : null

          const updatedEvent = {
            ...event,
            start: eventUpdate?.start || event.start,
            end: eventUpdate?.end || event.end,
          }

          const eventStartMinutes = Math.round(
            event.start.getTime() / 1000 / 60
          )
          const eventEndMinutes = Math.round(event.end.getTime() / 1000 / 60)

          const updatedEventStartMinutes = Math.round(
            updatedEvent.start.getTime() / 1000 / 60
          )
          const updatedEventEndMinutes = Math.round(
            updatedEvent.end.getTime() / 1000 / 60
          )

          return Array.from({ length: props.days })
            .map((_, index) => {
              const day = index + 1

              const dayStartMinutes =
                areaStartMinutes + (day - 1) * EVENT_TRACK_SIZE_MINUTES
              const dayEndMinutes = dayStartMinutes + EVENT_TRACK_SIZE_MINUTES

              const start = Math.max(eventStartMinutes, dayStartMinutes)
              const end = Math.min(eventEndMinutes, dayEndMinutes)

              const updatedStart = Math.max(
                updatedEventStartMinutes,
                dayStartMinutes
              )
              const updatedEnd = Math.min(updatedEventEndMinutes, dayEndMinutes)

              return [
                updatedEventEndMinutes >= dayStartMinutes &&
                updatedEventStartMinutes <= dayEndMinutes
                  ? {
                      event: updatedEvent,
                      day,
                      start: new Date(updatedStart * 60 * 1000),
                      end: new Date(updatedEnd * 60 * 1000),
                      isUpdating: !!eventUpdate,
                      isTransparent: false,
                      isResizable: updatedStart === updatedEventStartMinutes,
                    }
                  : null,
                eventUpdate?.type === 'drag' &&
                eventEndMinutes >= dayStartMinutes &&
                eventStartMinutes <= dayEndMinutes
                  ? {
                      event,
                      day,
                      start: new Date(start * 60 * 1000),
                      end: new Date(end * 60 * 1000),
                      isUpdating: false,
                      isTransparent: true,
                      isResizable: false,
                    }
                  : null,
              ]
            })
            .flat()
        })
        .map(dayEvents => [
          ...dayEvents
            .filter(dayEvent => !!dayEvent)
            .filter(dayEvent => !dayEvent.isUpdating)
            .sort((a, b) => a.start.getTime() + b.start.getTime())
            .map((dayEvent, index) => ({
              key: `${dayEvent.event.id}-${index}`,
              ...dayEvent,
            })),
          ...dayEvents
            .filter(dayEvent => !!dayEvent)
            .filter(dayEvent => dayEvent.isUpdating)
            .sort((a, b) => a.start.getTime() + b.start.getTime())
            .map((dayEvent, index) => ({
              key: `${dayEvent.event.id}-${index}-u`,
              ...dayEvent,
            })),
        ])
        .flat() || []

    const arrangedEvents = [
      ...Arranger.arrange(eventsWithUpdatesPerTrack.filter(e => !e.isUpdating)),
      ...eventsWithUpdatesPerTrack
        .filter(e => e.isUpdating)
        .map(e => ({
          item: e,
          column: 1,
          columns: 1,
        })),
    ]

    return arrangedEvents
      .map(arrangeResult => {
        const eventBlock = getPositionForEvent({
          start: new Date(arrangeResult.item.start),
          end: new Date(arrangeResult.item.end),
          column: arrangeResult.column,
          columns: arrangeResult.columns,
        })

        if (!eventBlock) {
          return null
        }

        return {
          key: arrangeResult.item.key,
          event: arrangeResult.item.event,
          start: arrangeResult.item.start,
          end: arrangeResult.item.end,
          top: eventBlock.top,
          left: eventBlock.left,
          height: eventBlock.height,
          width: eventBlock.width,
          isUpdating: arrangeResult.item.isUpdating,
          isTransparent: arrangeResult.item.isTransparent,
          isResizable: arrangeResult.item.isResizable,
        }
      })
      .filter(eventBlock => eventBlock !== null)
  }, [
    props.events,
    props.days,
    updatingEvent,
    areaStartMinutes,
    EVENT_TRACK_SIZE_MINUTES,
    getPositionForEvent,
  ])

  return (
    <div ref={setWrapperElement} className="relative flex w-full">
      {!!wrapperResizeObserverEntry && (
        <>
          {eventBlocks.map(eventBlock => (
            <EventView
              key={eventBlock.key}
              title={eventBlock.event.title}
              start={eventBlock.event.start}
              end={eventBlock.event.end}
              top={eventBlock.top}
              left={eventBlock.left}
              width={eventBlock.width}
              height={eventBlock.height}
              minHeight={
                (wrapperResizeObserverEntry.contentRect.height /
                  EVENT_TRACK_SIZE_MINUTES) *
                30
              }
              locale={props.locale}
              isFloating={eventBlock.isUpdating}
              isTransparent={eventBlock.isTransparent}
              isDraggable={!eventBlock.isUpdating && !eventBlock.isTransparent}
              isResizable={eventBlock.isResizable}
              onDrag={dragEvent => handleUpdate(eventBlock, dragEvent, 'drag')}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onResizeBarDrag={dragEvent =>
                handleUpdate(eventBlock, dragEvent, 'resize')
              }
              onResizeBarDragStart={onDragStart}
              onResizeBarDragEnd={onDragEnd}
            />
          ))}

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
