import { Component, output } from '@angular/core';

@Component({
  selector: 'app-arrow-buttons',
  templateUrl: './arrow-buttons.component.html',
})
export class ArrowButtonsComponent {
  clickPrevious = output();
  clickNext = output();

  directions: ('previous' | 'next')[] = ['previous', 'next'];

  handleClick(direction: 'previous' | 'next') {
    if (direction === 'previous') {
      this.clickPrevious.emit();
      return;
    }

    this.clickNext.emit();
  }
}
