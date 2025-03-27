import { DragEvent, useCallback, useState } from 'react'

export interface PositionToDateConverter {
  getDateForPosition(x: number, y: number): Date | null
}

export interface DragObserverState {
  eventId: string
  start: Date
}

export interface EventDragObserverOptions {
  wrapperTop: number
  wrapperLeft: number
  positionToDateConverter?: PositionToDateConverter
  onStateChange: (state: DragObserverState | undefined) => void
}

export interface EventDragObserver {
  onDrag: (eventId: string, dragEvent: DragEvent<Element>) => void
  onDragEnd: () => void
}

export function useEventDragObserver({
  wrapperTop,
  wrapperLeft,
  onStateChange,
  positionToDateConverter,
}: EventDragObserverOptions): EventDragObserver {
  const [initialMouseToEventTop, setInitialMouseToEventTop] = useState<number>()

  console.log(initialMouseToEventTop)

  const onDrag = useCallback(
    (eventId: string, dragEvent: DragEvent<Element>) => {
      dragEvent.stopPropagation()

      if (!dragEvent.currentTarget) {
        return
      }

      if (dragEvent.clientX <= 0 && dragEvent.clientY <= 0) {
        setInitialMouseToEventTop(undefined)
        onStateChange(undefined)
        return
      }

      const mouseToEventTop =
        dragEvent.clientY - dragEvent.currentTarget.getBoundingClientRect().top

      if (initialMouseToEventTop === undefined) {
        setInitialMouseToEventTop(mouseToEventTop)
      }

      const clientX = dragEvent.clientX - wrapperLeft
      const eventWindowTop =
        dragEvent.clientY - (initialMouseToEventTop ?? mouseToEventTop)
      const eventTop = eventWindowTop - wrapperTop

      const startDate = positionToDateConverter?.getDateForPosition(
        clientX,
        eventTop
      )

      if (!startDate) {
        return
      }

      onStateChange({
        eventId,
        start: startDate,
      })
    },
    [
      initialMouseToEventTop,
      onStateChange,
      positionToDateConverter,
      wrapperLeft,
      wrapperTop,
    ]
  )

  const onDragEnd = useCallback(() => {
    setInitialMouseToEventTop(undefined)
    onStateChange(undefined)
  }, [onStateChange])

  return {
    onDrag,
    onDragEnd,
  }
}
