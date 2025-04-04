import { Component, computed, input, output, signal } from '@angular/core'
import {
  EventArea,
  HasStartAndEndDate,
  DraggingCanvas,
  DraggingEventSketch,
  DraggingEventUpdateState,
  DraggingEventUpdate,
  Arranger,
  DraggingBehavior,
} from '@calendar-ui/core'
import { Event } from '../day-or-week-view/day-or-week-view.component'
import {
  DragObserverDirective,
  DragState,
} from '../common/drag-observer.directive'
import { ResizeObserverDirective } from '../common/resize-observer.directive'
import { EventAreaGridComponent } from '../event-area-grid/event-area-grid.component'
import { InvisibleDragDirective } from '../common/invisible-drag.directive'
import { EventComponent } from '../event/event.component'
import { EventInfoModalComponent } from '../event-info-modal/event-info-modal.component'

@Component({
  selector: 'app-event-area',
  templateUrl: './event-area.component.html',
  imports: [
    ResizeObserverDirective,
    EventAreaGridComponent,
    InvisibleDragDirective,
    DragObserverDirective,
    EventComponent,
    EventInfoModalComponent,
  ],
  host: { class: 'w-full' },
})
export class EventAreaComponent {
  start = input.required<Date>()
  days = input.required<number>()
  events = input<Event[]>([])
  dayPaddingRight = input<number>()
  blockPadding = input<number>()
  selectedEventId = input<string>()
  dragIntervalMs = input<number>()
  minEventSizeMs = input<number>()

  selectEvent = output<string | undefined>()
  changeEvents = output<Event[]>()
  sketchEvent = output<HasStartAndEndDate>()

  selectedEvent = computed(() => {
    const selectedEventId = this.selectedEventId()

    return !!selectedEventId
      ? this.events().find(event => event.id === selectedEventId)
      : undefined
  })

  eventSketchState = signal<DragState | undefined>(undefined)
  draggingEventUpdateState = signal<DraggingEventUpdateState | undefined>(
    undefined
  )

  wrapperResizeObserverEntry = signal<ResizeObserverEntry | null>(null)

  eventArea = computed(() => {
    const wrapperResizeObserverEntry = this.wrapperResizeObserverEntry()

    if (!wrapperResizeObserverEntry) {
      return
    }

    const eventArea = new EventArea(
      {
        start: this.start(),
        days: this.days(),
        width: wrapperResizeObserverEntry.contentRect.width,
        height: wrapperResizeObserverEntry.contentRect.height,
        top: wrapperResizeObserverEntry.target.getBoundingClientRect().top,
        left: wrapperResizeObserverEntry.target.getBoundingClientRect().left,
        blockPadding: this.blockPadding(),
        dayPaddingRight: this.dayPaddingRight(),
        events: this.events(),
      },
      new Arranger()
    )

    const draggingCanvas: DraggingCanvas = {
      getDateForPosition: eventArea.getDateForPosition.bind(eventArea),
    }

    const eventSketchState = this.eventSketchState()
    if (eventSketchState) {
      eventArea.sketch = new DraggingEventSketch(
        eventSketchState,
        draggingCanvas,
        {
          sizeIntervalMs: this.dragIntervalMs(),
          minEventSizeMs: this.minEventSizeMs(),
        }
      )
    }

    const draggingEventUpdateState = this.draggingEventUpdateState()
    if (draggingEventUpdateState) {
      eventArea.update = new DraggingEventUpdate(
        draggingEventUpdateState,
        draggingCanvas,
        {
          dragIntervalMs: this.dragIntervalMs(),
          minEventSizeMs: this.minEventSizeMs(),
        }
      )
    }

    return eventArea
  })

  handleWrapperResize(entry: ResizeObserverEntry | null) {
    this.wrapperResizeObserverEntry.set(entry)
  }

  handleDrag(event?: DragState) {
    this.eventSketchState.set(event)
  }

  handleConfirmSketchEvent() {
    const eventSketchState = this.eventSketchState()
    const eventArea = this.eventArea()
    const wrapperResizeObserverEntry = this.wrapperResizeObserverEntry()

    if (!eventSketchState || !eventArea || !wrapperResizeObserverEntry) {
      return
    }

    const draggingCanvas: DraggingCanvas = {
      getDateForPosition: eventArea.getDateForPosition.bind(eventArea),
    }

    const eventSketch = new DraggingEventSketch(
      eventSketchState,
      draggingCanvas,
      {
        sizeIntervalMs: this.dragIntervalMs(),
        minEventSizeMs: this.minEventSizeMs(),
      }
    )

    this.sketchEvent.emit({ start: eventSketch.start, end: eventSketch.end })
  }

  handleSelectEvent(eventId: string | undefined) {
    this.selectEvent.emit(eventId)
  }

  handleDragEvent(
    behavior: DraggingBehavior,
    event: Event,
    dragState?: DragState
  ) {
    this.draggingEventUpdateState.set(
      dragState
        ? {
            behavior,
            eventDurationMs: event.end.getTime() - event.start.getTime(),
            eventEnd: event.end,
            eventId: event.id,
            initialClientX: dragState.initialClientX,
            initialClientY: dragState.initialClientY,
            clientX: dragState.clientX,
            clientY: dragState.clientY,
          }
        : undefined
    )
  }

  handleConfirmDragEvent() {
    const draggingEventUpdateState = this.draggingEventUpdateState()
    const eventArea = this.eventArea()
    const wrapperResizeObserverEntry = this.wrapperResizeObserverEntry()

    if (
      !draggingEventUpdateState ||
      !eventArea ||
      !wrapperResizeObserverEntry
    ) {
      return
    }

    const draggingCanvas: DraggingCanvas = {
      getDateForPosition: eventArea.getDateForPosition.bind(eventArea),
    }

    const draggingEvent = new DraggingEventUpdate(
      draggingEventUpdateState,
      draggingCanvas,
      {
        dragIntervalMs: this.dragIntervalMs(),
        minEventSizeMs: this.minEventSizeMs(),
      }
    )

    const updatedEvents = this.events().map(event => {
      if (event.id === draggingEventUpdateState.eventId) {
        return {
          ...event,
          start: draggingEvent.start,
          end: draggingEvent.end,
        }
      }

      return event
    })

    this.changeEvents.emit(updatedEvents)
  }

  handleChangeEventTitle(eventId: string, title?: string) {
    const updatedEvents = this.events().map(event =>
      event.id === eventId ? { ...event, title } : event
    )

    this.changeEvents.emit(updatedEvents)
  }

  handleDeleteEvent(eventId: string) {
    const updatedEvents = this.events().filter(event => event.id !== eventId)

    this.changeEvents.emit(updatedEvents)
  }

  handleCloseEventInfoModal() {
    this.selectEvent.emit(undefined)
  }
}
