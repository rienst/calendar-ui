import { DragEventHandler, useCallback, useState } from 'react'

export interface InitialDragState {
  initialEventTop: number
  initialEventLeft: number
}

export interface DragState extends InitialDragState {
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
    setInitialDragState({
      initialEventTop:
        event.clientY - event.currentTarget.getBoundingClientRect().top,
      initialEventLeft:
        event.clientX - event.currentTarget.getBoundingClientRect().left,
    })
  }, [])

  const onDrag = useCallback<DragEventHandler<Element>>(
    event => {
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
        eventTop:
          event.clientY - event.currentTarget.getBoundingClientRect().top,
        eventLeft:
          event.clientX - event.currentTarget.getBoundingClientRect().left,
      }

      onStateChange?.(state)
    },
    [initialDragState, onStateChange, onConfirm]
  )

  const onDragEnd = useCallback<DragEventHandler<Element>>(() => {
    setInitialDragState(undefined)
    onStateChange?.(undefined)
  }, [onStateChange])

  return { onDragStart, onDrag, onDragEnd }
}
