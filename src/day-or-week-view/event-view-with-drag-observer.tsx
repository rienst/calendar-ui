import { Locale } from 'date-fns'
import { EventView } from './event-view'
import { DragState, useDragObserver } from '../hooks/use-drag-observer'
import { useInvisibleDragHandlers } from '../hooks/use-invisible-drag-handlers'

export interface EventViewWithDragObserverProps {
  title: string
  start: Date
  end: Date
  top: number
  left: number
  width: number
  height: number
  minHeight?: number
  isFloating?: boolean
  isTransparent?: boolean
  isResizable?: boolean
  locale?: Locale
  isDraggable?: boolean
  onDragStateChange?: (state: DragState | undefined) => void
  onDragConfirm?: () => void
}

export function EventViewWithDragObserver(
  props: EventViewWithDragObserverProps
) {
  const dragObserver = useDragObserver({
    onStateChange: props.onDragStateChange,
    onConfirm: props.onDragConfirm,
  })

  const invisibleDragHandlers = useInvisibleDragHandlers({
    onDragStart: dragObserver.onDragStart,
    onDragEnd: dragObserver.onDragEnd,
  })

  return (
    <EventView
      {...props}
      onDragStart={invisibleDragHandlers.onDragStart}
      onDrag={dragObserver.onDrag}
      onDragEnd={invisibleDragHandlers.onDragEnd}
    />
  )
}
