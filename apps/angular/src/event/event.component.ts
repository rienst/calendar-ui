import { CommonModule } from '@angular/common'
import { Component, computed, input, output } from '@angular/core'
import {
  DragObserverDirective,
  DragState,
} from '../common/drag-observer.directive'
import { InvisibleDragDirective } from '../common/invisible-drag.directive'

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  host: {
    '[style]': 'style()',
    '[class]': 'className()',
  },
  imports: [CommonModule, DragObserverDirective, InvisibleDragDirective],
})
export class EventComponent {
  title = input<string>()
  start = input.required<Date>()
  end = input.required<Date>()
  top = input.required<number>()
  left = input.required<number>()
  width = input.required<number>()
  height = input.required<number>()
  isFloating = input(false)
  isTransparent = input(false)
  isMovable = input(false)
  isResizable = input(false)

  resize = output<DragState | undefined>()
  confirmResize = output()

  style = computed(() => ({
    top: `${this.top()}px`,
    left: `${this.left()}px`,
    width: `${this.width()}px`,
    height: `${this.height()}px`,
  }))

  className = computed(() =>
    [
      'flex absolute select-none text-sm bg-blue-500 overflow-hidden text-white pl-1.5 py-0.5 rounded-md h-full',
      this.height() >= 36 ? 'flex-col' : 'gap-2',
      this.isFloating()
        ? 'shadow-lg shadow-black/50 z-30 ring ring-white dark:ring-black'
        : 'z-10',
      this.isTransparent() ? 'opacity-50' : 'cursor-pointer',
    ].join(' ')
  )

  handleDragResizeBar(state: DragState | undefined) {
    this.resize.emit(state)
  }

  handleConfirmDragResizeBar() {
    this.confirmResize.emit()
  }
}
