import { Component, input } from '@angular/core'
import { addDays, isToday } from 'date-fns'
import { CurrentHourMarkerComponent } from '../current-hour-marker/current-hour-marker.component'

@Component({
  selector: 'app-event-area-grid',
  templateUrl: './event-area-grid.component.html',
  host: { class: 'flex w-full' },
  imports: [CurrentHourMarkerComponent],
})
export class EventAreaGridComponent {
  start = input.required<Date>()
  days = input<number>(1)
  hours = input<number>(24)

  arrayOfLength(length: number): number[] {
    return Array.from({ length }, (_, i) => i)
  }

  isCurrentDay(index: number): boolean {
    const day = addDays(this.start(), index)
    return isToday(day)
  }
}
