import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[invisibleDrag]',
})
export class InvisibleDragDirective {
  blankCanvas: HTMLCanvasElement | null = null;

  @HostListener('dragstart', ['$event']) handleDragStart(event: DragEvent) {
    const blankCanas = document.createElement('canvas');
    blankCanas.style.position = 'fixed';
    blankCanas.style.top = '-99px';
    blankCanas.style.width = '1px';
    blankCanas.style.height = '1px';

    event.dataTransfer?.setDragImage(blankCanas, 0, 0);
    document.body.appendChild(blankCanas);

    this.blankCanvas = blankCanas;
  }

  @HostListener('dragend') handleDragEnd() {
    if (this.blankCanvas) {
      document.body.removeChild(this.blankCanvas);
      this.blankCanvas = null;
    }
  }
}
