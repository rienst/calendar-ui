import { DragEventHandler, useCallback, useRef } from 'react'

export interface DragEvents {
  onDragStart: DragEventHandler<HTMLElement>
  onDragEnd: DragEventHandler<HTMLElement>
}

export function useInvisibleDragHandlers({
  onDragStart: onDragStartCallback,
  onDragEnd: onDragEndCallback,
}: Partial<DragEvents> = {}): DragEvents {
  const blankCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const onDragStart = useCallback<DragEventHandler<HTMLElement>>(
    event => {
      const blankCanas = document.createElement('canvas')
      blankCanas.style.position = 'fixed'
      blankCanas.style.top = '-99px'
      blankCanas.style.width = '1px'
      blankCanas.style.height = '1px'
      event.dataTransfer.setDragImage(blankCanas, 0, 0)
      document.body?.appendChild(blankCanas)
      blankCanvasRef.current = blankCanas

      onDragStartCallback?.(event)
    },
    [onDragStartCallback]
  )

  const onDragEnd = useCallback<DragEventHandler<HTMLElement>>(
    event => {
      if (blankCanvasRef.current) {
        document.body?.removeChild(blankCanvasRef.current)
        blankCanvasRef.current = null
      }

      onDragEndCallback?.(event)
    },
    [onDragEndCallback]
  )

  return {
    onDragStart,
    onDragEnd,
  }
}
