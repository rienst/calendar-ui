import { ArrangeResult, IArranger } from '../arranger'
import { NoopArranger } from '../noop-arranger'

export interface Event {
  id: string
  start: Date
  end: Date
}

interface Position {
  top: number
  left: number
  height: number
  width: number
}

export interface EventBlock<TEvent> extends Position {
  event: TEvent
  key: string
  isUpdate: boolean
  isBeingUpdated: boolean
}

export interface EventUpdate {
  eventId: string
  start: Date
  end: Date
}

export interface EventAreaInit<TEvent> {
  start: Date
  days: number
  height: number
  width: number
  top?: number
  left?: number
  dayPaddingRight?: number
  blockPadding?: number
  events?: TEvent[]
  update?: EventUpdate
}

export class EventArea<TEvent extends Event> {
  start
  days
  height
  width
  top
  left
  dayPaddingRight
  eventBlockPadding
  events
  update

  private readonly dayMs = 1000 * 60 * 60 * 24

  private get end() {
    return new Date(this.start.getTime() + this.dayMs * this.days)
  }

  private get dayWidth() {
    return this.width / this.days
  }

  private get dayWidthWithoutPadding() {
    return this.dayWidth - this.dayPaddingRight
  }

  private get updatingEvent(): TEvent | null {
    if (!this.update) {
      return null
    }

    const initialEvent = this.events.find(
      event => event.id === this.update?.eventId
    )

    if (!initialEvent) {
      return null
    }

    return {
      ...initialEvent,
      start: this.update.start,
      end: this.update.end,
    }
  }

  constructor(
    init: EventAreaInit<TEvent>,
    private readonly arranger: IArranger = new NoopArranger()
  ) {
    this.start = init.start
    this.days = init.days
    this.height = init.height
    this.width = init.width
    this.top = init.top || 0
    this.left = init.left || 0
    this.dayPaddingRight = init.dayPaddingRight || 0
    this.eventBlockPadding = init.blockPadding || 0
    this.events = init.events || []
    this.update = init.update
  }

  getEventBlocks(): EventBlock<TEvent>[] {
    const standardEventBlocks = this.getStandardEventBlocks()
    const draggingEventBlocks = this.getDraggingEventBlocks()

    return [...standardEventBlocks, ...draggingEventBlocks]
  }

  private getStandardEventBlocks() {
    const arrangeResults = this.arrangEvents(this.events)

    return arrangeResults
      .map(arrangeResult =>
        this.createEventBlockForEventArrangeResult(arrangeResult)
      )
      .filter(block => block !== null)
      .map(block => ({
        ...block,
        event: this.applyInitialEventDate(block.event),
      }))
  }

  private applyInitialEventDate(event: TEvent): TEvent {
    const initialEvent = this.events.find(
      initialEvent => initialEvent.id === event.id
    )

    if (!initialEvent) {
      return event
    }

    return {
      ...event,
      start: initialEvent.start,
      end: initialEvent.end,
    }
  }

  private getDraggingEventBlocks(): EventBlock<TEvent>[] {
    const updatingEvent = this.updatingEvent

    if (!updatingEvent) {
      return []
    }

    const eventsByStartDay = this.getEventsByStartDay([updatingEvent])

    return Object.values(eventsByStartDay)
      .flat()
      .map((event, index) => {
        const position = this.getPositionForEventBlockArrangeResult({
          item: event,
          column: 1,
          columns: 1,
        })

        if (!position) {
          return null
        }

        return this.constructDraggingEventBlock(event, index, position)
      })
      .filter(block => block !== null)
      .map(block => ({
        ...block,
        event: updatingEvent,
      }))
  }

  private arrangEvents(events: TEvent[]): ArrangeResult<TEvent>[] {
    const eventsByStartDay = this.getEventsByStartDay(events)

    return Object.values(eventsByStartDay)
      .map(event => this.arranger.arrange(event))
      .flat()
  }

  private getEventsByStartDay(events: TEvent[]) {
    const eventsSplitByDay = events
      .filter(event => this.isEventBlockInArea(event.start, event.end))
      .map(event => this.splitEventByDay(event))
      .flat()

    return this.divideEventsByStartDay(eventsSplitByDay)
  }

  private splitEventByDay(event: TEvent): TEvent[] {
    return Array.from({ length: this.days }, (_, index): TEvent | null => {
      const day = index + 1
      const startOfDay = this.getStartOfDay(day)
      const endOfDay = this.getEndOfDay(day)

      if (!startOfDay || !endOfDay) {
        return null
      }

      if (
        event.start.getTime() >= endOfDay.getTime() ||
        event.end.getTime() <= startOfDay.getTime()
      ) {
        return null
      }

      const startThisDay =
        event.start.getTime() < startOfDay.getTime() ? startOfDay : event.start
      const endThisDay =
        event.end.getTime() > endOfDay.getTime() ? endOfDay : event.end

      return {
        ...event,
        start: startThisDay,
        end: endThisDay,
      }
    }).filter(event => event !== null)
  }

  private divideEventsByStartDay(events: TEvent[]): Record<number, TEvent[]> {
    return events.reduce((acc, eventBlock) => {
      const day = Math.floor(
        (eventBlock.start.getTime() - this.start.getTime()) / this.dayMs
      )

      acc[day] = acc[day] || []
      acc[day].push(eventBlock)
      return acc
    }, {} as Record<number, TEvent[]>)
  }

  private createEventBlockForEventArrangeResult(
    arrangeResult: ArrangeResult<TEvent>
  ): EventBlock<TEvent> | null {
    const position = this.getPositionForEventBlockArrangeResult(arrangeResult)

    if (!position) {
      return null
    }

    return this.constructEventBlock(arrangeResult.item, position)
  }

  private constructEventBlock(
    event: TEvent,
    position: Position
  ): EventBlock<TEvent> {
    return {
      key: this.getEventBlockKey(event.id, event.start),
      event,
      isUpdate: false,
      isBeingUpdated: this.isItemTransparent(event.id),
      ...position,
    }
  }

  private constructDraggingEventBlock(
    event: TEvent,
    index: number,
    position: Position
  ): EventBlock<TEvent> {
    return {
      key: `${event.id}_${index}_drag`,
      event,
      isUpdate: true,
      isBeingUpdated: false,
      ...position,
    }
  }

  private getEventBlockKey(eventId: string, start: Date): string {
    const eventsByStartDay = this.getEventsByStartDay(this.events)
    const nthBlockForEvent = Object.values(eventsByStartDay)
      .flat()
      .filter(event => event.id === eventId)
      .findIndex(eventBlock => eventBlock.start.getTime() === start.getTime())

    return `${eventId}_${nthBlockForEvent}`
  }

  private isItemTransparent(itemId: string): boolean {
    if (!this.update) {
      return false
    }

    return this.update.eventId === itemId
  }

  private getPositionForEventBlockArrangeResult(
    arrangeResult: ArrangeResult<TEvent>
  ): Position | null {
    const top = this.getEventBlockTop(arrangeResult.item.start)
    const height = this.getEventBlockHeight(
      arrangeResult.item.start,
      arrangeResult.item.end
    )
    const left = this.getEventBlockLeft(
      arrangeResult.item.start,
      arrangeResult.column,
      arrangeResult.columns
    )
    const width = this.getEventBlockWidth(arrangeResult.columns)

    return {
      top,
      left,
      height,
      width,
    }
  }

  private isEventBlockInArea(
    eventBlockStart: Date,
    eventBlockEnd: Date
  ): boolean {
    if (eventBlockEnd.getTime() <= this.start.getTime()) {
      return false
    }

    if (eventBlockStart.getTime() >= this.end.getTime()) {
      return false
    }

    return true
  }

  private getEventBlockTop(eventBlockStart: Date): number {
    const blockStartOrAreaStart = this.getBlockStartOrAreaStart(eventBlockStart)

    const topOffsetMs =
      (blockStartOrAreaStart.getTime() - this.start.getTime()) % this.dayMs

    return this.msToPx(topOffsetMs)
  }

  private getEventBlockHeight(
    eventBlockStart: Date,
    eventBlockEnd: Date
  ): number {
    const blockStartOrAreaStart = this.getBlockStartOrAreaStart(eventBlockStart)
    const blockEndOrAreaDayEnd = this.getBlockEndOrAreaDayEnd(
      eventBlockStart,
      eventBlockEnd
    )

    const eventDurationMs =
      blockEndOrAreaDayEnd.getTime() - blockStartOrAreaStart.getTime()

    const eventDurationHeight = this.msToPx(eventDurationMs)

    return eventDurationHeight - this.eventBlockPadding
  }

  private getEventBlockLeft(
    eventBlockStart: Date,
    column: number,
    columns: number
  ): number {
    const dayLeft = this.getDayLeft(eventBlockStart)
    const columnLeft = this.getColumnLeft(column, columns)

    return dayLeft + columnLeft
  }

  private getDayLeft(eventBlockStart: Date): number {
    const blockStartDay = Math.floor(
      (eventBlockStart.getTime() - this.start.getTime()) / this.dayMs
    )

    return blockStartDay * this.dayWidth
  }

  private getColumnLeft(column: number, columns: number): number {
    const columnWidth = this.dayWidthWithoutPadding / columns

    return (column - 1) * columnWidth
  }

  private getEventBlockWidth(columns: number): number {
    const columnWidth = this.dayWidthWithoutPadding / columns

    return columnWidth - this.eventBlockPadding
  }

  private getBlockStartOrAreaStart(blockStart: Date): Date {
    return blockStart.getTime() > this.start.getTime() ? blockStart : this.start
  }

  private getBlockEndOrAreaDayEnd(blockStart: Date, blockEnd: Date): Date {
    const blockStartOrAreaStart = this.getBlockStartOrAreaStart(blockStart)
    const blockStartDay = Math.floor(
      (blockStartOrAreaStart.getTime() - this.start.getTime()) / this.dayMs
    )

    const endOfBlockStartDay = new Date(
      this.start.getTime() + this.dayMs * (blockStartDay + 1)
    )

    return blockEnd.getTime() < endOfBlockStartDay.getTime()
      ? blockEnd
      : endOfBlockStartDay
  }

  getStartOfDay(day: number) {
    if (day < 0 || day > this.days) {
      return null
    }

    return new Date(this.start.getTime() + this.dayMs * (day - 1))
  }

  getEndOfDay(day: number) {
    const startOfDay = this.getStartOfDay(day)

    if (!startOfDay) {
      return null
    }

    return new Date(startOfDay.getTime() + this.dayMs)
  }

  getDateForPosition(x: number, y: number): Date {
    const areaOffsetX = x - this.left
    const areaOffsetY = y - this.top

    const day = this.getDayForPosition(areaOffsetX)
    const topOffsetMs = this.pxToMs(areaOffsetY)

    const precedingDaysOffsetMs = this.dayMs * (day - 1)

    return new Date(this.start.getTime() + precedingDaysOffsetMs + topOffsetMs)
  }

  private getDayForPosition(x: number): number {
    return Math.floor(x / this.dayWidth) + 1
  }

  private msToPx(ms: number): number {
    return (ms / this.dayMs) * this.height
  }

  private pxToMs(px: number): number {
    return (px / this.height) * this.dayMs
  }
}
