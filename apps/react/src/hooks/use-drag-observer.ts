import { DragEventHandler, useCallback, useState } from 'react'

export interface InitialDragState {
  initialClientY: number
  initialClientX: number
}

export interface DragState extends InitialDragState {
  clientY: number
  clientX: number
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
      initialClientY: event.clientY,
      initialClientX: event.clientX,
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
        clientY: event.clientY,
        clientX: event.clientX,
      }

      onStateChange?.(state)
    },
    [initialDragState, onStateChange, onConfirm]
  )

  const onDragEnd = useCallback<DragEventHandler<Element>>(
    event => {
      event.stopPropagation()
      onConfirm?.()
      setInitialDragState(undefined)
      onStateChange?.(undefined)
    },
    [onConfirm, onStateChange]
  )

  return { onDragStart, onDrag, onDragEnd }
}
