import { Component, computed, DestroyRef, inject, signal } from '@angular/core'

@Component({
  selector: 'app-current-hour-marker',
  templateUrl: './current-hour-marker.component.html',
})
export class CurrentHourMarkerComponent {
  private destroyRef = inject(DestroyRef)
  private now = signal(new Date())

  constructor() {
    const interval = setInterval(() => {
      this.now.set(new Date())
    }, 1000)

    this.destroyRef.onDestroy(() => clearInterval(interval))
  }

  private minutesPassedToday = computed(
    () => this.now().getHours() * 60 + this.now().getMinutes()
  )

  top = computed(() => `${(this.minutesPassedToday() / 1440) * 100}%`)
}
