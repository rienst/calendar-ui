import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  OnInit,
  output,
} from '@angular/core';

@Directive({
  selector: '[resizeObserver]',
})
export class ResizeObserverDirective implements OnInit {
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  observeResize = output<ResizeObserverEntry>();

  ngOnInit() {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      this.observeResize.emit(entry);
    });

    observer.observe(this.element.nativeElement);

    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
