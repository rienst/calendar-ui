import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface TabOption<TValue> {
  id?: string;
  label: string;
  value: TValue;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  imports: [CommonModule],
})
export class TabsComponent<TValue> {
  options = input.required<TabOption<TValue>[]>();
  value = input<TValue>();

  change = output<TValue>();

  select(value: TValue) {
    this.change.emit(value);
  }
}
