import { describe, expect, it } from 'vitest'
import { DraggingEventSketch } from './dragging-event-sketch'

describe('DraggingEventUpdate', () => {
  it('exists', () => {
    expect(DraggingEventSketch).toBeDefined()
  })

  describe('start', () => {
    it('returns the date for the initial client position', () => {
      const draggingEventSketch = new DraggingEventSketch(
        {
          initialClientY: 50,
          initialClientX: 0,
          clientY: 100,
          clientX: 200,
        },
        {
          getDateForPosition: (x: number, y: number) => {
            const msInDay = 86400000
            const areaHeight = 100
            const msPerPx = msInDay / areaHeight

            return new Date(
              new Date('2021-01-01T00:00:00Z').getTime() + y * msPerPx
            )
          },
        }
      )

      expect(draggingEventSketch.start).toEqual(
        new Date('2021-01-01T12:00:00Z')
      )
    })

    it('returns the date rounded down to the nearest interval if one is provided', () => {
      const draggingEventSketch = new DraggingEventSketch(
        {
          initialClientY: 51,
          initialClientX: 0,
          clientY: 100,
          clientX: 200,
        },
        {
          getDateForPosition: (x: number, y: number) => {
            const msInDay = 86400000
            const areaHeight = 100
            const msPerPx = msInDay / areaHeight

            return new Date(
              new Date('2021-01-01T00:00:00Z').getTime() + y * msPerPx
            )
          },
        },
        {
          sizeIntervalMs: 60 * 60 * 1000,
        }
      )

      expect(draggingEventSketch.start).toEqual(
        new Date('2021-01-01T12:00:00Z')
      )
    })
  })

  describe('end', () => {
    it('returns the date for the current client position', () => {
      const draggingEventSketch = new DraggingEventSketch(
        {
          initialClientY: 50,
          initialClientX: 0,
          clientY: 100,
          clientX: 0,
        },
        {
          getDateForPosition: (x: number, y: number) => {
            const msInDay = 86400000
            const areaHeight = 100
            const msPerPx = msInDay / areaHeight

            return new Date(
              new Date('2021-01-01T00:00:00Z').getTime() + y * msPerPx
            )
          },
        }
      )

      expect(draggingEventSketch.end).toEqual(new Date('2021-01-02T00:00:00Z'))
    })

    it('returns the date rounded up to the nearest interval if one is provided', () => {
      const draggingEventSketch = new DraggingEventSketch(
        {
          initialClientY: 50,
          initialClientX: 0,
          clientY: 51,
          clientX: 0,
        },
        {
          getDateForPosition: (x: number, y: number) => {
            const msInDay = 86400000
            const areaHeight = 100
            const msPerPx = msInDay / areaHeight

            return new Date(
              new Date('2021-01-01T00:00:00Z').getTime() + y * msPerPx
            )
          },
        },
        {
          sizeIntervalMs: 60 * 60 * 1000,
        }
      )

      expect(draggingEventSketch.end).toEqual(new Date('2021-01-01T13:00:00Z'))
    })

    it('will not return an end date before the start date', () => {
      const draggingEventSketch = new DraggingEventSketch(
        {
          initialClientY: 50,
          initialClientX: 0,
          clientY: 0,
          clientX: 0,
        },
        {
          getDateForPosition: (x: number, y: number) => {
            const msInDay = 86400000
            const areaHeight = 100
            const msPerPx = msInDay / areaHeight

            return new Date(
              new Date('2021-01-01T00:00:00Z').getTime() + y * msPerPx
            )
          },
        },
        {
          sizeIntervalMs: 60 * 60 * 1000,
        }
      )

      expect(draggingEventSketch.end).toEqual(new Date('2021-01-01T12:00:00Z'))
    })

    it('will not return an end date which whould make the offset from start less than the min event size ms, if provided', () => {
      const draggingEventSketch = new DraggingEventSketch(
        {
          initialClientY: 50,
          initialClientX: 0,
          clientY: 51,
          clientX: 0,
        },
        {
          getDateForPosition: (x: number, y: number) => {
            const msInDay = 86400000
            const areaHeight = 100
            const msPerPx = msInDay / areaHeight

            return new Date(
              new Date('2021-01-01T00:00:00Z').getTime() + y * msPerPx
            )
          },
        },
        {
          minEventSizeMs: 2 * 60 * 60 * 1000,
          sizeIntervalMs: 60 * 60 * 1000,
        }
      )

      expect(draggingEventSketch.end).toEqual(new Date('2021-01-01T14:00:00Z'))
    })
  })
})
