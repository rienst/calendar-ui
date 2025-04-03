import { Component, input } from '@angular/core';

@Component({
  selector: 'app-event-area-grid',
  templateUrl: './event-area-grid.component.html',
  host: { class: 'flex w-full' },
})
export class EventAreaGridComponent {
  days = input<number>(1);
  hours = input<number>(24);

  arrayOfLength(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }
}
