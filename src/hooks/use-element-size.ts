import { useEffect, useState } from 'react'

export function useResizeObserver(element: HTMLElement | null) {
  const [rect, setRect] = useState<ResizeObserverEntry | null>(null)

  useEffect(() => {
    if (!element) {
      return
    }

    const observer = new ResizeObserver(entries => setRect(entries[0] ?? null))

    observer.observe(element)

    return () => observer.disconnect()
  }, [element])

  return rect
}
