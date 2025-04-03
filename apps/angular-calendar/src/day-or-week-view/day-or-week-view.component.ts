import { Component, computed, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HasStartAndEndDate } from '@calendar-ui/core'
import {
  addDays,
  Day,
  eachDayOfInterval,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { ArrowButtonsComponent } from '../arrow-buttons/arrow-buttons.component'
import { StyledButtonDirective } from '../common/styled-button.directive'
import { TabOption, TabsComponent } from '../tabs/tabs.component'
import { DayMarkersComponent } from '../day-markers/day-markers.component'
import { HourMarkersComponent } from '../hour-markers/hour-markers.component'
import { EventAreaComponent } from '../event-area/event-area.component'

export type DayOrWeekViewType = 'week' | 'day'

export interface Event {
  id: string
  title?: string
  start: Date
  end: Date
}

@Component({
  selector: 'app-day-or-week-view',
  templateUrl: './day-or-week-view.component.html',
  imports: [
    ArrowButtonsComponent,
    CommonModule,
    StyledButtonDirective,
    TabsComponent,
    DayMarkersComponent,
    HourMarkersComponent,
    EventAreaComponent,
  ],
})
export class DayOrWeekViewComponent {
  view = input<DayOrWeekViewType>('day')
  weekStartsOn = input<Day>(0)
  viewingDate = input.required<Date>()
  events = input<Event[]>([])
  selectedEventId = input<string | undefined>(undefined)

  changeViewingDate = output<Date>()
  changeView = output<DayOrWeekViewType>()
  changeEvents = output<Event[]>()
  sketchEvent = output<HasStartAndEndDate>()
  selectEvent = output<string | undefined>()

  trackStartingDates = computed(() =>
    this.view() === 'week'
      ? eachDayOfInterval({
          start: startOfWeek(this.viewingDate(), {
            weekStartsOn: this.weekStartsOn(),
          }),
          end: startOfDay(
            endOfWeek(this.viewingDate(), { weekStartsOn: this.weekStartsOn() })
          ),
        })
      : [startOfDay(this.viewingDate())]
  )

  titleDateFormat = computed(() =>
    this.view() === 'day' ? 'EEEEEE d MMMM yyyy' : 'MMMM yyyy'
  )

  tabOptions: TabOption<DayOrWeekViewType>[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
  ]

  handleSelectDay(date: Date) {
    this.changeViewingDate.emit(date)
    this.changeView.emit('day')
  }

  handleChangeView(view: DayOrWeekViewType) {
    this.changeView.emit(view)
  }

  handleTodayButtonClick() {
    this.changeViewingDate.emit(new Date())
  }

  handlePreviousArrowClick() {
    const newViewingDate = addDays(
      this.viewingDate(),
      this.view() === 'day' ? -1 : -7
    )

    this.changeViewingDate.emit(newViewingDate)
  }

  handleNextArrowClick() {
    const newViewingDate = addDays(
      this.viewingDate(),
      this.view() === 'day' ? 1 : 7
    )

    this.changeViewingDate.emit(newViewingDate)
  }

  handleChangeEvents(events: Event[]) {
    this.changeEvents.emit(events)
  }

  handleSelectEvent(eventId: string | undefined) {
    this.selectEvent.emit(eventId)
  }

  handleSketchEvent(event: HasStartAndEndDate) {
    this.sketchEvent.emit(event)
  }
}
