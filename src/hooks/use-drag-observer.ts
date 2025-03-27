import { DragEventHandler, useCallback, useState } from 'react'

export interface InitialDragState {
  initialEventTop: number
  initialEventLeft: number
}

export interface DragState {
  initialEventTop: number
  initialEventLeft: number
  eventTop: number
  eventLeft: number
}

export interface DragObserver {
  onDragStart: DragEventHandler<Element>
  onDrag: DragEventHandler<Element>
  onDragEnd: DragEventHandler<Element>
}

export interface UseDragObserverOptions {
  onStateChange?: (state: DragState | undefined) => void
  onConfirm?: () => void
}

export function useDragObserver({
  onStateChange,
  onConfirm,
}: UseDragObserverOptions = {}): DragObserver {
  const [initialDragState, setInitialDragState] = useState<InitialDragState>()

  const onDragStart = useCallback<DragEventHandler<Element>>(event => {
    event.stopPropagation()
    setInitialDragState({
      initialEventTop: event.clientY,
      initialEventLeft: event.clientX,
    })
  }, [])

  const onDrag = useCallback<DragEventHandler<Element>>(
    event => {
      event.stopPropagation()

      if (!initialDragState) {
        return
      }

      if (event.clientX === 0 && event.clientY === 0) {
        onConfirm?.()
        onStateChange?.(undefined)
        return
      }

      const state: DragState = {
        ...initialDragState,
        eventTop: event.clientY,
        eventLeft: event.clientX,
      }

      onStateChange?.(state)
    },
    [initialDragState, onStateChange, onConfirm]
  )

  const onDragEnd = useCallback<DragEventHandler<Element>>(
    event => {
      event.stopPropagation()
      setInitialDragState(undefined)
      onStateChange?.(undefined)
    },
    [onStateChange]
  )

  return { onDragStart, onDrag, onDragEnd }
}
