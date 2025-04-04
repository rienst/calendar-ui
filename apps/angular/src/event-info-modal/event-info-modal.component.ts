import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core'

@Component({
  selector: 'app-event-info-modal',
  templateUrl: './event-info-modal.component.html',
  imports: [CommonModule, FormsModule],
})
export class EventInfoModalComponent {
  private inputElement = viewChild<ElementRef<HTMLInputElement>>('input')
  private destroyRef = inject(DestroyRef)

  constructor() {
    const abortController = new AbortController()

    window.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          this.close.emit()
        }
      },
      { signal: abortController.signal }
    )

    effect(() => {
      const input = this.inputElement()

      if (input && this.isOpen()) {
        input.nativeElement.focus()
      }
    })

    this.destroyRef.onDestroy(() => {
      abortController.abort()
    })
  }

  isOpen = input.required<boolean>()
  start = input.required<Date>()
  end = input.required<Date>()
  title = model<string | undefined>('')

  deleteEvent = output()
  close = output()

  handleDelete() {
    this.deleteEvent.emit()
  }

  handleClose() {
    this.close.emit()
  }
}
