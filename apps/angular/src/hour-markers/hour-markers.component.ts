import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { eachHourOfInterval, endOfDay, startOfDay } from 'date-fns';

@Component({
  selector: 'app-hour-markers',
  templateUrl: './hour-markers.component.html',
  imports: [CommonModule],
})
export class HourMarkersComponent {
  date = input.required<Date>();

  hours = computed(() =>
    eachHourOfInterval({
      start: startOfDay(this.date()),
      end: endOfDay(this.date()),
    }).slice(1)
  );
}
