import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import {
  Component,
  effect,
  ElementRef,
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
  dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialog')

  constructor() {
    effect(() => this.dialogRef()?.nativeElement?.showModal())
  }

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
