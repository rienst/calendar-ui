import { Locale } from 'date-fns'
import { DragEvent, DragEventHandler, useMemo, useState } from 'react'
import { EventView } from './event-view'
import { useInvisibleDragHandlers } from '../hooks/use-invisible-drag-handlers'
import { useEventArea } from './event-area'

export interface ResizableEventViewProps {
  title: string
  start: Date
  end: Date
  column: number
  columns: number
  isTransparent?: boolean
  draggable?: boolean
  onDrag?: DragEventHandler<HTMLDivElement>
  onDragStart?: DragEventHandler<HTMLDivElement>
  onDragEnd?: DragEventHandler<HTMLDivElement>
  locale?: Locale
  onResized?: (start: Date, end: Date) => void
}

export function ResizableEventView(props: ResizableEventViewProps) {
  const { getDatesForResizingEvent } = useEventArea()

  const [resizingOffsetToEventEndY, setResizingOffsetToEventEndY] = useState<
    number | null
  >(null)
  const [resizingClientOffset, setResizingClientOffset] = useState<{
    x: number
    y: number
  } | null>(null)

  const resizingEventDates = useMemo(() => {
    if (!resizingOffsetToEventEndY || !resizingClientOffset) {
      return null
    }

    return getDatesForResizingEvent({
      mouseWindowOffsetXPx: resizingClientOffset.x,
      eventEndWindowOffsetYPx:
        resizingClientOffset.y + resizingOffsetToEventEndY,
      eventStart: props.start,
    })
  }, [
    resizingOffsetToEventEndY,
    resizingClientOffset,
    props.start,
    getDatesForResizingEvent,
  ])

  function handleResizeBarDragStart(event: DragEvent) {
    event.stopPropagation()

    setResizingOffsetToEventEndY(
      event.clientY - event.currentTarget.getBoundingClientRect().bottom
    )
  }

  function handleResizeBarDrag(event: DragEvent) {
    event.stopPropagation()

    if (
      (event.clientX === 0 && event.clientY === 0) ||
      !resizingOffsetToEventEndY
    ) {
      confirmResize()
      setResizingOffsetToEventEndY(null)
      setResizingClientOffset(null)
      return
    }

    setResizingClientOffset({
      x: event.clientX,
      y: event.clientY,
    })
  }

  function handleResizeBarDragEnd(event: DragEvent) {
    event.stopPropagation()

    setResizingOffsetToEventEndY(null)
    setResizingClientOffset(null)
  }

  const { onDragStart: onResizeBarDragStart, onDragEnd: onResizeBarDragEnd } =
    useInvisibleDragHandlers({
      onDragStart: handleResizeBarDragStart,
      onDragEnd: handleResizeBarDragEnd,
    })

  function confirmResize() {
    if (!props.onResized || !resizingEventDates) {
      return
    }

    props.onResized(resizingEventDates.start, resizingEventDates.end)
  }

  return (
    <EventView
      title={props.title}
      start={resizingEventDates ? resizingEventDates.start : props.start}
      end={resizingEventDates ? resizingEventDates.end : props.end}
      column={resizingEventDates ? 1 : props.column}
      columns={resizingEventDates ? 1 : props.columns}
      isTransparent={props.isTransparent}
      draggable={props.draggable}
      onDrag={props.onDrag}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      resizable
      onResizeBarDrag={handleResizeBarDrag}
      onResizeBarDragStart={onResizeBarDragStart}
      onResizeBarDragEnd={onResizeBarDragEnd}
      isFloating={!!resizingEventDates}
      locale={props.locale}
    />
  )
}
