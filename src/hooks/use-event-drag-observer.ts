import { DragEvent, DragEventHandler, useCallback, useState } from 'react'

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
  dragIntervalMs?: number
  positionToDateConverter?: PositionToDateConverter
  onDragConfirm?: (state: DragObserverState) => void
  onStateChange: (state: DragObserverState | undefined) => void
}

export interface EventDragObserver {
  onDragStart: DragEventHandler<Element>
  onDrag: (eventId: string, dragEvent: DragEvent<Element>) => void
  onDragEnd: () => void
}

export function useEventDragObserver({
  wrapperTop,
  wrapperLeft,
  dragIntervalMs,
  positionToDateConverter,
  onDragConfirm,
  onStateChange,
}: EventDragObserverOptions): EventDragObserver {
  const [state, setState] = useState<DragObserverState | undefined>()
  const [initialMouseToEventTop, setInitialMouseToEventTop] = useState<number>()

  const onDragStart = useCallback<DragEventHandler<Element>>(event => {
    setInitialMouseToEventTop(
      event.clientY - event.currentTarget.getBoundingClientRect().top
    )
  }, [])

  const onDrag = useCallback(
    (eventId: string, dragEvent: DragEvent<Element>) => {
      dragEvent.stopPropagation()

      if (!dragEvent.currentTarget || !initialMouseToEventTop) {
        return
      }

      if (dragEvent.clientX <= 0 && dragEvent.clientY <= 0) {
        if (state) {
          onDragConfirm?.(state)
        }

        setInitialMouseToEventTop(undefined)
        setState(undefined)
        onStateChange(undefined)
        return
      }

      const clientX = dragEvent.clientX - wrapperLeft
      const eventWindowTop = dragEvent.clientY - initialMouseToEventTop
      const eventTop = eventWindowTop - wrapperTop

      const startDate = positionToDateConverter?.getDateForPosition(
        clientX,
        eventTop
      )

      if (!startDate) {
        return
      }

      const snappedStartDateMs = dragIntervalMs
        ? Math.round(startDate.getTime() / dragIntervalMs) * dragIntervalMs
        : startDate.getTime()

      const snappedStartDate = new Date(snappedStartDateMs)

      setState({
        eventId,
        start: snappedStartDate,
      })

      onStateChange({
        eventId,
        start: snappedStartDate,
      })
    },
    [
      initialMouseToEventTop,
      onStateChange,
      onDragConfirm,
      state,
      dragIntervalMs,
      positionToDateConverter,
      wrapperLeft,
      wrapperTop,
    ]
  )

  const onDragEnd = useCallback(() => {
    setInitialMouseToEventTop(undefined)
    setState(undefined)
    onStateChange(undefined)
  }, [onStateChange])

  return { onDragStart, onDrag, onDragEnd }
}
