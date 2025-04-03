import { Directive, HostListener, output, signal } from '@angular/core';

export interface InitialDragState {
  initialClientY: number;
  initialClientX: number;
}

export interface DragState extends InitialDragState {
  clientY: number;
  clientX: number;
}

@Directive({
  selector: '[dragObserver]',
})
export class DragObserverDirective {
  initialDragState = signal<InitialDragState | undefined>(undefined);

  observeDrag = output<DragState | undefined>();
  confirmDrag = output();

  @HostListener('dragstart', ['$event']) handleDragStart(event: DragEvent) {
    event.stopPropagation();
    this.initialDragState.set({
      initialClientY: event.clientY,
      initialClientX: event.clientX,
    });
  }

  @HostListener('drag', ['$event']) handleDrag(event: DragEvent) {
    event.stopPropagation();

    const initialDragState = this.initialDragState();

    if (!initialDragState) {
      return;
    }

    if (event.clientX === 0 && event.clientY === 0) {
      this.confirmDrag.emit();
      this.observeDrag.emit(undefined);
      return;
    }

    this.observeDrag.emit({
      ...initialDragState,
      clientY: event.clientY,
      clientX: event.clientX,
    });
  }

  @HostListener('dragend', ['$event']) handleDragEnd(event: DragEvent) {
    event.stopPropagation();
    this.initialDragState.set(undefined);
    this.confirmDrag.emit();
    this.observeDrag.emit(undefined);
  }
}
