import { HasStartAndEndDate } from './event-area'
import { DraggingCanvas } from './dragging-canvas'

export interface DraggingEventSketchState {
  initialClientY: number
  initialClientX: number
  clientY: number
  clientX: number
}

export interface EventSketchingOptions {
  sizeIntervalMs?: number
  minEventSizeMs?: number
}

export class DraggingEventSketch implements HasStartAndEndDate {
  constructor(
    private state: DraggingEventSketchState,
    private canvas: DraggingCanvas,
    private options: EventSketchingOptions = {}
  ) {}

  get start(): Date {
    const start = this.canvas.getDateForPosition(
      this.state.initialClientX,
      this.state.initialClientY
    )

    if (!this.options.sizeIntervalMs) {
      return start
    }

    return new Date(
      Math.floor(start.getTime() / this.options.sizeIntervalMs) *
        this.options.sizeIntervalMs
    )
  }

  get end(): Date {
    const end = this.canvas.getDateForPosition(
      this.state.clientX,
      this.state.clientY
    )

    const roundedEnd = this.options.sizeIntervalMs
      ? new Date(
          Math.ceil(end.getTime() / this.options.sizeIntervalMs) *
            this.options.sizeIntervalMs
        )
      : end

    const minEnd = new Date(
      this.start.getTime() + Math.max(this.options.minEventSizeMs || 0, 0)
    )

    return new Date(Math.max(minEnd.getTime(), roundedEnd.getTime()))
  }
}
