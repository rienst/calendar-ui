import { Locale } from 'date-fns'
import { useInvisibleDragHandlers } from '../hooks/use-invisible-drag-handlers'
import { DragEvent, useMemo, useState } from 'react'
import { ResizableEventView } from './resizable-event-view'
import { EventView } from './event-view'
import { useEventArea } from './event-area'

export interface DraggableEventViewProps {
  id: string
  title: string
  start: Date
  end: Date
  column: number
  columns: number
  locale?: Locale
  onStartEndChanged?: (start: Date, end: Date) => void
}

export function DraggableEventView(props: DraggableEventViewProps) {
  const { getDatesForDraggingEvent } = useEventArea()

  const [draggingYOffsetToEvent, setDraggingYOffsetToEvent] = useState<
    number | null
  >(null)
  const [draggingClientOffset, setDraggingClientOffset] = useState<{
    x: number
    y: number
  } | null>(null)

  const draggingEventDates = useMemo(() => {
    if (!draggingYOffsetToEvent || !draggingClientOffset) {
      return null
    }

    return getDatesForDraggingEvent({
      mouseWindowOffsetXPx: draggingClientOffset.x,
      eventWindowOffsetYPx: draggingClientOffset.y - draggingYOffsetToEvent,
      eventLengthMinutes: Math.round(
        (props.end.getTime() - props.start.getTime()) / 1000 / 60
      ),
    })
  }, [
    draggingYOffsetToEvent,
    draggingClientOffset,
    props.end,
    props.start,
    getDatesForDraggingEvent,
  ])

  function handleDragStart(event: DragEvent) {
    setDraggingYOffsetToEvent(
      event.clientY - event.currentTarget.getBoundingClientRect().top
    )
  }

  function handleDrag(event: DragEvent) {
    if (event.clientX === 0 && event.clientY === 0) {
      confirmDrag()
      setDraggingYOffsetToEvent(null)
      setDraggingClientOffset(null)
      return
    }

    setDraggingClientOffset({
      x: event.clientX,
      y: event.clientY,
    })
  }

  function handleDragEnd() {
    setDraggingYOffsetToEvent(null)
    setDraggingClientOffset(null)
  }

  const { onDragStart, onDragEnd } = useInvisibleDragHandlers({
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  })

  function confirmDrag() {
    if (!props.onStartEndChanged || !draggingEventDates) {
      return
    }

    props.onStartEndChanged(draggingEventDates.start, draggingEventDates.end)
  }

  return (
    <>
      <ResizableEventView
        title={props.title}
        start={props.start}
        end={props.end}
        column={props.column}
        columns={props.columns}
        draggable
        onDrag={handleDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        isTransparent={!!draggingEventDates}
        locale={props.locale}
        onResized={props.onStartEndChanged}
      />

      {draggingEventDates && (
        <EventView
          title={props.title}
          start={draggingEventDates.start}
          end={draggingEventDates.end}
          column={1}
          columns={1}
          locale={props.locale}
          isFloating
        />
      )}
    </>
  )
}
