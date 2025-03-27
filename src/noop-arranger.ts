import { ArrangeResult, IArranger, WithStartAndEnd } from './arranger'

export class NoopArranger implements IArranger {
  arrange<TItem extends WithStartAndEnd>(
    items: TItem[]
  ): ArrangeResult<TItem>[] {
    return items.map(item => ({
      item,
      column: 1,
      columns: 1,
    }))
  }
}
