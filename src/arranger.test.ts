import { describe, expect, it } from 'vitest'
import { WithStartAndEnd, Arranger } from './arranger'

describe('Arranger', () => {
  it('exists', () => {
    expect(Arranger).toBeDefined()
  })

  describe('arrange', () => {
    it('arranges a single item correctly', () => {
      const timespan: WithStartAndEnd = { start: 0, end: 1 }

      const result = Arranger.arrange([timespan])

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(1)
      expect(result[0].item).toBe(timespan)
    })

    it('arranges two items with the same start and end values correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 0, end: 1 },
        { start: 0, end: 1 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(2)
      expect(result[0].item).toBe(timespans[0])

      expect(result[1].column).toBe(2)
      expect(result[1].columns).toBe(2)
      expect(result[1].item).toBe(timespans[1])
    })

    it('arranges two items with the same start value correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 0, end: 1 },
        { start: 0, end: 2 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(2)
      expect(result[0].item).toBe(timespans[0])

      expect(result[1].column).toBe(2)
      expect(result[1].columns).toBe(2)
      expect(result[1].item).toBe(timespans[1])
    })

    it('arranges two items with the same end value correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 0, end: 2 },
        { start: 1, end: 2 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(2)
      expect(result[0].item).toBe(timespans[0])

      expect(result[1].column).toBe(2)
      expect(result[1].columns).toBe(2)
      expect(result[1].item).toBe(timespans[1])
    })

    it('arranges items overlapping partially correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 0, end: 2 },
        { start: 1, end: 3 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(2)
      expect(result[0].item).toBe(timespans[0])

      expect(result[1].column).toBe(2)
      expect(result[1].columns).toBe(2)
      expect(result[1].item).toBe(timespans[1])
    })

    it('arranges items overlapping fully correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 1, end: 2 },
        { start: 0, end: 3 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(2)
      expect(result[0].item).toBe(timespans[1])

      expect(result[1].column).toBe(2)
      expect(result[1].columns).toBe(2)
      expect(result[1].item).toBe(timespans[0])
    })

    it('arranges items that do not overlap correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 1, end: 2 },
        { start: 2, end: 3 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(1)
      expect(result[0].item).toBe(timespans[0])

      expect(result[1].column).toBe(1)
      expect(result[1].columns).toBe(1)
      expect(result[1].item).toBe(timespans[1])
    })

    it('arranges items that overlap and do not overlap correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 1, end: 2 },
        { start: 1, end: 2 },
        { start: 2, end: 3 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(2)
      expect(result[0].item).toBe(timespans[0])

      expect(result[1].column).toBe(2)
      expect(result[1].columns).toBe(2)
      expect(result[1].item).toBe(timespans[1])

      expect(result[2].column).toBe(1)
      expect(result[2].columns).toBe(1)
      expect(result[2].item).toBe(timespans[2])
    })

    it('arranges an item that does not overlap with a previous column correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 1, end: 3 },
        { start: 2, end: 5 },
        { start: 4, end: 6 },
        { start: 5, end: 7 },
        { start: 6, end: 8 },
        { start: 7, end: 9 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(2)
      expect(result[0].item).toBe(timespans[0])

      expect(result[1].column).toBe(2)
      expect(result[1].columns).toBe(2)
      expect(result[1].item).toBe(timespans[1])

      expect(result[2].column).toBe(1)
      expect(result[2].columns).toBe(2)
      expect(result[2].item).toBe(timespans[2])

      expect(result[3].column).toBe(2)
      expect(result[3].columns).toBe(2)
      expect(result[3].item).toBe(timespans[3])

      expect(result[4].column).toBe(1)
      expect(result[4].columns).toBe(2)
      expect(result[4].item).toBe(timespans[4])

      expect(result[5].column).toBe(2)
      expect(result[5].columns).toBe(2)
      expect(result[5].item).toBe(timespans[5])
    })

    it('arranges three overlapping item correctly', () => {
      const timespans: WithStartAndEnd[] = [
        { start: 1, end: 4 },
        { start: 2, end: 4 },
        { start: 3, end: 5 },
      ]

      const result = Arranger.arrange(timespans)

      expect(result[0].column).toBe(1)
      expect(result[0].columns).toBe(3)
      expect(result[0].item).toBe(timespans[0])

      expect(result[1].column).toBe(2)
      expect(result[1].columns).toBe(3)
      expect(result[1].item).toBe(timespans[1])

      expect(result[2].column).toBe(3)
      expect(result[2].columns).toBe(3)
      expect(result[2].item).toBe(timespans[2])
    })
  })
})
