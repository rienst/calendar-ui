import { describe, expect, it } from 'vitest'
import { DraggingEventUpdate } from './dragging-event-update'

describe('DraggingEventUpdate', () => {
  it('exists', () => {
    expect(DraggingEventUpdate).toBeDefined()
  })

  describe('eventId', () => {
    it('is set to the eventId from the init object', () => {
      const update = new DraggingEventUpdate(
        {
          behavior: 'move',
          eventId: 'event-1',
          eventEnd: new Date(),
          eventDurationMs: 0,
          initialClientY: 0,
          initialClientX: 0,
          clientY: 0,
          clientX: 0,
        },
        {
          getDateForPosition: () => new Date(),
        }
      )

      expect(update.eventId).toBe('event-1')
    })
  })

  describe('end', () => {
    it('calculates the time between the initial event position and the current event position and returns the event end date plus that time', () => {
      const update = new DraggingEventUpdate(
        {
          behavior: 'move',
          eventId: 'event-1',
          eventEnd: new Date('2021-01-01T06:00:00Z'),
          eventDurationMs: 60 * 60 * 1000,
          initialClientX: 0,
          initialClientY: 25,
          clientX: 0,
          clientY: 50,
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

      expect(update.end).toEqual(new Date('2021-01-01T12:00:00Z'))
    })

    it('calculates the correct time for a multi-day canvas', () => {
      const update = new DraggingEventUpdate(
        {
          behavior: 'move',
          eventId: 'event-1',
          eventEnd: new Date('2021-01-05T06:00:00Z'),
          eventDurationMs: 60 * 60 * 1000,
          initialClientX: 40,
          initialClientY: 25,
          clientX: 60,
          clientY: 50,
        },
        {
          getDateForPosition: (x: number, y: number) => {
            const areaDays = 10
            const areaWidth = 100
            const areaHeight = 100

            const day = Math.floor(x / (areaWidth / areaDays))

            const msInDay = 86400000
            const msPerPx = msInDay / areaHeight

            return new Date(
              new Date('2021-01-01T00:00:00Z').getTime() +
                y * msPerPx +
                day * msInDay
            )
          },
        }
      )

      expect(update.end).toEqual(new Date('2021-01-07T12:00:00Z'))
    })

    it('rounds the time up to the nearest drag interval', () => {
      const update = new DraggingEventUpdate(
        {
          behavior: 'move',
          eventId: 'event-1',
          eventEnd: new Date('2021-01-01T00:00:00Z'),
          eventDurationMs: 60 * 60 * 1000,
          initialClientX: 0,
          initialClientY: 0,
          clientX: 0,
          clientY: 51,
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
          dragIntervalMs: 15 * 60 * 1000,
        }
      )

      expect(update.end).toEqual(new Date('2021-01-01T12:15:00Z'))
    })

    it('rounds the time down to the nearest drag interval', () => {
      const update = new DraggingEventUpdate(
        {
          behavior: 'move',
          eventId: 'event-1',
          eventEnd: new Date('2021-01-01T00:00:00Z'),
          eventDurationMs: 60 * 60 * 1000,
          initialClientX: 0,
          initialClientY: 0,
          clientX: 0,
          clientY: 49,
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
          dragIntervalMs: 15 * 60 * 1000,
        }
      )

      expect(update.end).toEqual(new Date('2021-01-01T11:45:00Z'))
    })

    it('does not return an end date which does not satisfy the minimal event size ms', () => {
      const update = new DraggingEventUpdate(
        {
          behavior: 'resize',
          eventId: 'event-1',
          eventEnd: new Date('2021-01-01T01:00:00Z'),
          eventDurationMs: 60 * 60 * 1000,
          initialClientX: 0,
          initialClientY: 50,
          clientX: 0,
          clientY: 0,
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
          minEventSizeMs: 30 * 60 * 1000,
        }
      )

      expect(update.end).toEqual(new Date('2021-01-01T00:30:00Z'))
    })
  })

  describe('start', () => {
    it("when behavior is 'move', is set to the computed end date minus the event duration", () => {
      const update = new DraggingEventUpdate(
        {
          behavior: 'move',
          eventId: 'event-1',
          eventEnd: new Date('2021-01-01T01:00:00Z'),
          eventDurationMs: 60 * 60 * 1000,
          initialClientX: 0,
          initialClientY: 0,
          clientX: 0,
          clientY: 50,
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

      expect(update.start).toEqual(new Date('2021-01-01T12:00:00Z'))
    })

    it("when behavior is 'resize', is set to the initial end date minus the event duration", () => {
      const update = new DraggingEventUpdate(
        {
          behavior: 'resize',
          eventId: 'event-1',
          eventEnd: new Date('2021-01-01T01:00:00Z'),
          eventDurationMs: 60 * 60 * 1000,
          initialClientX: 0,
          initialClientY: 0,
          clientX: 0,
          clientY: 50,
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

      expect(update.start).toEqual(new Date('2021-01-01T00:00:00Z'))
    })
  })
})
