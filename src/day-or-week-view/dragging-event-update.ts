import { EventUpdate } from './event-area'

export interface DraggingEventState {
  eventId: string
  eventStart: Date
  eventDurationMs: number
  initialEventTop: number
  initialEventLeft: number
  eventTop: number
  eventLeft: number
}

export interface DraggingCanvas {
  getDateForPosition: (x: number, y: number) => Date
}

export class DraggingEventUpdate implements EventUpdate {
  readonly type = 'drag'

  constructor(
    private state: DraggingEventState,
    private canvas: DraggingCanvas,
    private dragIntervalMs = 0
  ) {}

  get eventId() {
    return this.state.eventId
  }

  get start() {
    const timeForInitialPosition = this.canvas.getDateForPosition(
      this.state.initialEventLeft,
      this.state.initialEventTop
    )

    const msBetweenInitialPositionAndEventStart =
      this.state.eventStart.getTime() - timeForInitialPosition.getTime()

    const timeForCurrentPosition = this.canvas.getDateForPosition(
      this.state.eventLeft,
      this.state.eventTop
    )

    const eventStartForCurrentPosition = new Date(
      timeForCurrentPosition.getTime() + msBetweenInitialPositionAndEventStart
    )

    return this.dragIntervalMs > 0
      ? new Date(
          Math.round(
            eventStartForCurrentPosition.getTime() / this.dragIntervalMs
          ) * this.dragIntervalMs
        )
      : eventStartForCurrentPosition
  }

  get end() {
    return new Date(this.start.getTime() + this.state.eventDurationMs)
  }
}
