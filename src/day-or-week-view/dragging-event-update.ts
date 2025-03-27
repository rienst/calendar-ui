import { EventUpdate } from './event-area'

export type DraggingBehavior = 'move' | 'resize'

export interface DraggingEventState {
  behavior: DraggingBehavior
  eventId: string
  eventEnd: Date
  eventDurationMs: number
  initialEventBottom: number
  initialEventLeft: number
  eventBottom: number
  eventLeft: number
}

export interface DraggingCanvas {
  getDateForPosition: (x: number, y: number) => Date
}

export interface EventDraggingOptions {
  dragIntervalMs?: number
  minEventSizeMs?: number
}

export class DraggingEventUpdate implements EventUpdate {
  constructor(
    private state: DraggingEventState,
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
      this.state.initialEventLeft,
      this.state.initialEventBottom
    )

    const msBetweenInitialPositionAndEventEnd =
      this.state.eventEnd.getTime() - timeForInitialPosition.getTime()

    const timeForCurrentPosition = this.canvas.getDateForPosition(
      this.state.eventLeft,
      this.state.eventBottom
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
