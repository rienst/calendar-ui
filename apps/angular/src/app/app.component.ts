import { Component, signal } from '@angular/core'
import { HasStartAndEndDate } from '@calendar-ui/core'
import {
  DayOrWeekViewType,
  Event,
  DayOrWeekViewComponent,
} from '../day-or-week-view/day-or-week-view.component'
import { ProjectBannerComponent } from '../project-banner/project-banner.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [DayOrWeekViewComponent, ProjectBannerComponent],
})
export class AppComponent {
  viewingDate = signal(new Date())
  view = signal<DayOrWeekViewType>(window.innerWidth < 768 ? 'day' : 'week')
  selectedEventId = signal<string | undefined>(undefined)
  events = signal<Event[]>([])

  handleChangeViewingDate(viewingDate: Date) {
    this.viewingDate.set(viewingDate)
  }

  handleChangeView(view: DayOrWeekViewType) {
    this.view.set(view)
  }

  handleEventClick(eventId: string) {
    this.selectedEventId.set(eventId)
  }

  handleSelectEvent(selectedEventId: string | undefined) {
    this.selectedEventId.set(selectedEventId)
  }

  handleChangeEvents(events: Event[]) {
    this.events.set(events)
  }

  handleSketchEvent(sketch: HasStartAndEndDate) {
    const id = Math.random().toString()
    this.events.update(events => [...events, { id, ...sketch }])
    this.selectedEventId.set(id)
  }
}
