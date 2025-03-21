import { Locale } from 'date-fns'
import { useEventTrack } from './event-track'
import {
  DragEvent,
  DragEventHandler,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { EventView } from './event-view'
import { useInvisibleDragHandlers } from '../hooks/use-invisible-drag-handlers'

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
  const { getDatesForResizingEvent } = useEventTrack()

  const [resizingOffsetToEventEndY, setResizingOffsetToEventEndY] = useState<
    number | null
  >(null)
  const [resizingClientY, setResizingClientY] = useState<number | null>(null)

  const resizingEventDates = useMemo(() => {
    if (!resizingOffsetToEventEndY || !resizingClientY) {
      return null
    }

    const eventEndWindowOffsetYPx = resizingClientY + resizingOffsetToEventEndY

    return getDatesForResizingEvent({
      eventEndWindowOffsetYPx,
      eventStart: props.start,
    })
  }, [
    resizingOffsetToEventEndY,
    resizingClientY,
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
      setResizingClientY(null)
      return
    }

    setResizingClientY(event.clientY)
  }

  function handleResizeBarDragEnd(event: DragEvent) {
    event.stopPropagation()

    setResizingOffsetToEventEndY(null)
    setResizingClientY(null)
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

  useEffect(
    () =>
      console.log({
        resizingOffsetToEventEndY,
        resizingClientY,
        resizingEventDates,
      }),
    [resizingEventDates, resizingOffsetToEventEndY, resizingClientY]
  )

  return (
    <EventView
      title={props.title}
      start={resizingEventDates ? resizingEventDates.start : props.start}
      end={resizingEventDates ? resizingEventDates.end : props.end}
      column={props.column}
      columns={props.columns}
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
