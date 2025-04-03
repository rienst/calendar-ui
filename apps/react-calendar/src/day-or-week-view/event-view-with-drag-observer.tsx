import { MouseEventHandler } from 'react'
import { Locale } from 'date-fns'
import { DraggingBehavior } from '@calendar-ui/core'
import { EventView } from './event-view'
import { DragState, useDragObserver } from '../hooks/use-drag-observer'
import { useInvisibleDragHandlers } from '../hooks/use-invisible-drag-handlers'

export interface EventViewDragState extends DragState {
  behavior: DraggingBehavior
}

export interface EventViewWithDragObserverProps {
  title?: string
  start: Date
  end: Date
  top: number
  left: number
  width: number
  height: number
  isFloating?: boolean
  isTransparent?: boolean
  locale?: Locale
  isMovable?: boolean
  isResizable?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
  onDragStateChange?: (state: EventViewDragState | undefined) => void
  onDragConfirm?: () => void
}

export function EventViewWithDragObserver(
  props: EventViewWithDragObserverProps
) {
  const moveObserver = useDragObserver({
    onStateChange: state =>
      props.onDragStateChange?.(
        state ? { ...state, behavior: 'move' } : undefined
      ),
    onConfirm: props.onDragConfirm,
  })

  const resizeObserver = useDragObserver({
    onStateChange: state =>
      props.onDragStateChange?.(
        state ? { ...state, behavior: 'resize' } : undefined
      ),
    onConfirm: props.onDragConfirm,
  })

  const invisibleMoveHandlers = useInvisibleDragHandlers({
    onDragStart: moveObserver.onDragStart,
    onDragEnd: moveObserver.onDragEnd,
  })

  const invisibleResizeHandlers = useInvisibleDragHandlers({
    onDragStart: resizeObserver.onDragStart,
    onDragEnd: resizeObserver.onDragEnd,
  })

  return (
    <EventView
      {...props}
      onDrag={moveObserver.onDrag}
      onDragStart={invisibleMoveHandlers.onDragStart}
      onDragEnd={invisibleMoveHandlers.onDragEnd}
      onResizeBarDrag={resizeObserver.onDrag}
      onResizeBarDragStart={invisibleResizeHandlers.onDragStart}
      onResizeBarDragEnd={invisibleResizeHandlers.onDragEnd}
    />
  )
}
