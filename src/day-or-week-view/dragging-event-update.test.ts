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
          eventId: 'event-1',
          eventStart: new Date(),
          eventDurationMs: 0,
          initialEventTop: 0,
          initialEventLeft: 0,
          eventTop: 0,
          eventLeft: 0,
        },
        {
          getDateForPosition: () => new Date(),
        }
      )

      expect(update.eventId).toBe('event-1')
    })
  })

  describe('type', () => {
    it('is set to "drag"', () => {
      const update = new DraggingEventUpdate(
        {
          eventId: 'event-1',
          eventStart: new Date(),
          eventDurationMs: 0,
          initialEventTop: 0,
          initialEventLeft: 0,
          eventTop: 0,
          eventLeft: 0,
        },
        {
          getDateForPosition: () => new Date(),
        }
      )

      expect(update.type).toBe('drag')
    })
  })

  describe('start', () => {
    it('calculates the time between the initial event position and the current event position and returns the event start date plus that time', () => {
      const update = new DraggingEventUpdate(
        {
          eventId: 'event-1',
          eventStart: new Date('2021-01-01T00:00:00Z'),
          eventDurationMs: 0,
          initialEventLeft: 0,
          initialEventTop: 0,
          eventLeft: 0,
          eventTop: 50,
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

    it('rounds the time up to the nearest drag interval', () => {
      const update = new DraggingEventUpdate(
        {
          eventId: 'event-1',
          eventStart: new Date('2021-01-01T00:00:00Z'),
          eventDurationMs: 0,
          initialEventLeft: 0,
          initialEventTop: 0,
          eventLeft: 0,
          eventTop: 51,
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
        15 * 60 * 1000
      )

      expect(update.start).toEqual(new Date('2021-01-01T12:15:00Z'))
    })

    it('rounds the time down to the nearest drag interval', () => {
      const update = new DraggingEventUpdate(
        {
          eventId: 'event-1',
          eventStart: new Date('2021-01-01T00:00:00Z'),
          eventDurationMs: 0,
          initialEventLeft: 0,
          initialEventTop: 0,
          eventLeft: 0,
          eventTop: 49,
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
        15 * 60 * 1000
      )

      expect(update.start).toEqual(new Date('2021-01-01T11:45:00Z'))
    })
  })

  describe('end', () => {
    it('is set to the computed start date plus the event duration', () => {
      const update = new DraggingEventUpdate(
        {
          eventId: 'event-1',
          eventStart: new Date('2021-01-01T00:00:00Z'),
          eventDurationMs: 60 * 60 * 1000,
          initialEventLeft: 0,
          initialEventTop: 0,
          eventLeft: 0,
          eventTop: 50,
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

      expect(update.end).toEqual(new Date('2021-01-01T13:00:00Z'))
    })
  })
})
