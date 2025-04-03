import { DraggingCanvas } from './dragging-canvas'
import { EventUpdate } from './event-area'

export type DraggingBehavior = 'move' | 'resize'

export interface DraggingEventUpdateState {
  behavior: DraggingBehavior
  eventId: string
  eventEnd: Date
  eventDurationMs: number
  initialClientY: number
  initialClientX: number
  clientY: number
  clientX: number
}

export interface EventDraggingOptions {
  dragIntervalMs?: number
  minEventSizeMs?: number
}

export class DraggingEventUpdate implements EventUpdate {
  constructor(
    private state: DraggingEventUpdateState,
    private canvas: DraggingCanvas,
    private options: EventDraggingOptions = {}
  ) {}

  get eventId() {
    return this.state.eventId
  }

  get start() {
    if (this.state.behavior === 'resize') {
      return new Date(
        this.state.eventEnd.getTime() - this.state.eventDurationMs
      )
    }

    return new Date(this.end.getTime() - this.state.eventDurationMs)
  }

  get end() {
    const timeForInitialPosition = this.canvas.getDateForPosition(
      this.state.initialClientX,
      this.state.initialClientY
    )

    const msBetweenInitialPositionAndEventEnd =
      this.state.eventEnd.getTime() - timeForInitialPosition.getTime()

    const timeForCurrentPosition = this.canvas.getDateForPosition(
      this.state.clientX,
      this.state.clientY
    )

    const eventEndForCurrentPosition = new Date(
      timeForCurrentPosition.getTime() + msBetweenInitialPositionAndEventEnd
    )

    const minEventEnd =
      this.state.behavior === 'resize'
        ? new Date(
            this.state.eventEnd.getTime() -
              this.state.eventDurationMs +
              (this.options.minEventSizeMs || 0)
          )
        : undefined

    const eventEnd = minEventEnd
      ? new Date(
          Math.max(eventEndForCurrentPosition.getTime(), minEventEnd.getTime())
        )
      : eventEndForCurrentPosition

    return this.options.dragIntervalMs
      ? new Date(
          Math.round(eventEnd.getTime() / this.options.dragIntervalMs) *
            this.options.dragIntervalMs
        )
      : eventEnd
  }
}
