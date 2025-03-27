export interface WithStartAndEnd {
  start: Date | number
  end: Date | number
}

interface ArrangedTimespan<TItem extends WithStartAndEnd> {
  item: TItem
  column: number
}

export interface ArrangeResult<TItem extends WithStartAndEnd>
  extends ArrangedTimespan<TItem> {
  columns: number
}

export interface IArranger {
  arrange<TItem extends WithStartAndEnd>(items: TItem[]): ArrangeResult<TItem>[]
}

export class Arranger implements IArranger {
  arrange<TItem extends WithStartAndEnd>(
    items: TItem[]
  ): ArrangeResult<TItem>[] {
    const groups = this.groupOverlapping(items)

    const arrangedGroups = groups.map(group => this.arrangeIntoColumns(group))

    return arrangedGroups.flat()
  }

  private dateToNumber(date: Date | number): number {
    return typeof date === 'number' ? date : new Date(date).getTime()
  }

  private groupOverlapping<TItem extends WithStartAndEnd>(
    timespans: TItem[]
  ): TItem[][] {
    const sortedTimespans = [...timespans].sort(
      (a, b) => this.dateToNumber(a.start) - this.dateToNumber(b.start)
    )

    const groups: TItem[][] = []
    let lastEnd = -Infinity

    sortedTimespans.forEach(timespan => {
      if (this.dateToNumber(timespan.start) >= lastEnd) {
        groups.push([timespan])
      } else {
        groups[groups.length - 1].push(timespan)
      }

      lastEnd = Math.max(lastEnd, this.dateToNumber(timespan.end))
    })

    return groups
  }

  private arrangeIntoColumns<TItem extends WithStartAndEnd>(
    timespans: TItem[]
  ): ArrangeResult<TItem>[] {
    if (timespans.length === 0) {
      return []
    }

    const sortedTimespans = [...timespans].sort(
      (a, b) => this.dateToNumber(a.start) - this.dateToNumber(b.start)
    )

    let activeTimespans: { end: number; column: number }[] = []
    const arrangedTimespans: ArrangedTimespan<TItem>[] = []

    sortedTimespans.forEach(timespan => {
      activeTimespans = activeTimespans.filter(
        activeTimespan => activeTimespan.end > this.dateToNumber(timespan.start)
      )

      const firstFreeColumn = this.firstUnused(
        activeTimespans.map(activeTimespan => activeTimespan.column) || []
      )

      arrangedTimespans.push({ item: timespan, column: firstFreeColumn })
      activeTimespans.push({
        end: this.dateToNumber(timespan.end),
        column: firstFreeColumn,
      })
      activeTimespans.sort((a, b) => a.end - b.end)
    })

    const maxColumn = Math.max(
      ...arrangedTimespans.map(activeTimespan => activeTimespan.column)
    )

    return arrangedTimespans.map(result => ({
      column: result.column,
      columns: maxColumn,
      item: result.item,
    }))
  }

  private firstUnused(numbers: number[]): number {
    const sorted = numbers.sort()

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i + 1) {
        return i + 1
      }
    }

    return sorted.length + 1
  }
}
