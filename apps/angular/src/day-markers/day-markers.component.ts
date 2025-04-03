import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Day, isToday } from 'date-fns';

@Component({
  selector: 'app-day-markers',
  templateUrl: './day-markers.component.html',
  imports: [CommonModule],
})
export class DayMarkersComponent {
  days = input.required<Date[]>();
  weekStartsOn = input.required<Day>();

  selectDay = output<Date>();

  handleSelectDay(day: Date) {
    this.selectDay.emit(day);
  }

  isToday(day: Date): boolean {
    return isToday(day);
  }
}
