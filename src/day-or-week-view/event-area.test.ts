import { describe, expect, it, vi } from 'vitest'
import { EventArea, Event, EventUpdate } from './event-area'
import { IArranger } from '../arranger'

describe('EventArea', () => {
  it('exists', () => {
    expect(EventArea).toBeDefined()
  })

  describe('getEventBlocks', () => {
    it('returns a block with a top of 0 when the start date is equal to the provided area start date', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T00:00:00Z'),
        end: new Date('2021-01-01T01:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.top).toBe(0)
    })

    it('returns the correct top for an area which starts earlier the same day as the event', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-01T13:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.top).toBe(50)
    })

    it('returns the correct top for an area which starts a day earlier than the event', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T12:00:00Z'),
        end: new Date('2021-01-02T13:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.top).toBe(50)
    })

    it('returns a top of 0 for an event event starting before, but ending after the area start date', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T22:00:00Z'),
        end: new Date('2021-01-02T02:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-02T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.top).toBe(0)
    })

    it('returns a top of 0 for an event event starting a day after the area start', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T00:00:00Z'),
        end: new Date('2021-01-02T02:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.top).toBe(0)
    })

    it('returns the correct height for a single day event', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T06:00:00Z'),
        end: new Date('2021-01-01T18:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.height).toBe(50)
    })

    it('returns the correct height for an event lasting after the end of the area height', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.height).toBe(50)
    })

    it('returns the correct height for an event lasting after the end of the area height on the second day', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T12:00:00Z'),
        end: new Date('2021-01-03T12:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 3,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.height).toBe(50)
    })

    it('returns the correct height for an event starting a day earlier and ending in the area', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-02T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.height).toBe(50)
    })

    it('returns no block for a event that ends before the area starts', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-03T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const blocks = area.getEventBlocks()

      expect(blocks).toHaveLength(0)
    })

    it('returns no block for a event that ends when the area starts', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T00:00:00Z'),
        end: new Date('2021-01-02T00:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-02T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const blocks = area.getEventBlocks()

      expect(blocks).toHaveLength(0)
    })

    it('returns no block for a event that starts after the area ends', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T12:00:00Z'),
        end: new Date('2021-01-03T12:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const blocks = area.getEventBlocks()

      expect(blocks).toHaveLength(0)
    })

    it('returns no block for a event that starts when the area ends', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T00:00:00Z'),
        end: new Date('2021-01-03T00:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const blocks = area.getEventBlocks()

      expect(blocks).toHaveLength(0)
    })

    it('returns the correct height for an event starting before the area start and ending after the area end', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T00:00:00Z'),
        end: new Date('2021-01-04T00:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-02T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.height).toBe(100)
    })

    it('returns a left of 0 for an event area starting the same day as the event event', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-01T13:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.left).toBe(0)
    })

    it('returns the correct left for an event area containing the event event, starting a day earlier than the event event', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T12:00:00Z'),
        end: new Date('2021-01-02T13:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.left).toBe(50)
    })

    it('returns the correct width for an event when the area is one day long', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-01T13:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.width).toBe(100)
    })

    it('return the correct width for an event when the area is two days long', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T13:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.width).toBe(50)
    })

    it('calls the arranger with the event events separated per day', () => {
      const arranger: IArranger = {
        arrange: vi.fn(items =>
          items.map(item => ({ item, column: 1, columns: 1 }))
        ),
      }

      const event0: Event = {
        id: '0',
        start: new Date('2020-12-31T12:00:00Z'),
        end: new Date('2020-12-31T13:00:00Z'),
      }

      const event1: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-01T13:00:00Z'),
      }

      const event2: Event = {
        id: '2',
        start: new Date('2021-01-01T14:00:00Z'),
        end: new Date('2021-01-01T15:00:00Z'),
      }

      const event3: Event = {
        id: '3',
        start: new Date('2021-01-02T12:00:00Z'),
        end: new Date('2021-01-02T13:00:00Z'),
      }

      const event4: Event = {
        id: '4',
        start: new Date('2021-01-03T12:00:00Z'),
        end: new Date('2021-01-03T13:00:00Z'),
      }

      const area = new EventArea(
        {
          start: new Date('2021-01-01T00:00:00Z'),
          days: 2,
          height: 100,
          width: 100,
          events: [event0, event1, event2, event3, event4],
        },
        arranger
      )

      area.getEventBlocks()

      expect(arranger.arrange).toHaveBeenCalledTimes(2)
      expect(arranger.arrange).toHaveBeenCalledWith([event1, event2])
      expect(arranger.arrange).toHaveBeenCalledWith([event3])
    })

    it('calls the arranger with the event events split per day', () => {
      const arranger: IArranger = {
        arrange: vi.fn(items =>
          items.map(item => ({ item, column: 1, columns: 1 }))
        ),
      }

      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea(
        {
          start: new Date('2021-01-01T00:00:00Z'),
          days: 2,
          height: 100,
          width: 100,
          events: [event],
        },
        arranger
      )

      area.getEventBlocks()

      expect(arranger.arrange).toHaveBeenCalledTimes(2)
      expect(arranger.arrange).toHaveBeenCalledWith([
        {
          id: '1',
          start: new Date('2021-01-01T12:00:00Z'),
          end: new Date('2021-01-02T00:00:00Z'),
        },
      ])
      expect(arranger.arrange).toHaveBeenCalledWith([
        {
          id: '1',
          start: new Date('2021-01-02T00:00:00Z'),
          end: new Date('2021-01-02T12:00:00Z'),
        },
      ])
    })

    it('returns the correct left when the item is arranged into a specific column', () => {
      const arranger: IArranger = {
        arrange: (items: any[]) =>
          items.map(item => ({
            item,
            column: 2,
            columns: 2,
          })),
      }

      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T00:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea(
        {
          start: new Date('2021-01-01T00:00:00Z'),
          days: 2,
          height: 100,
          width: 100,
          events: [event],
        },
        arranger
      )

      const [block] = area.getEventBlocks()

      expect(block.left).toBe(75)
    })

    it('returns the correct width when the item is arranged into a specific column', () => {
      const arranger: IArranger = {
        arrange: (items: any[]) =>
          items.map(item => ({
            item,
            column: 2,
            columns: 2,
          })),
      }

      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T00:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea(
        {
          start: new Date('2021-01-01T00:00:00Z'),
          days: 2,
          height: 100,
          width: 100,
          events: [event],
        },
        arranger
      )

      const [block] = area.getEventBlocks()

      expect(block.width).toBe(25)
    })

    it('returns the correct width when a day padding right is provided', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-01T13:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        dayPaddingRight: 12,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.width).toBe(88)
    })

    it('returns the correct width when the item is arranged into a specific column and a day padding right is provided', () => {
      const arranger: IArranger = {
        arrange: (items: any[]) =>
          items.map(item => ({
            item,
            column: 2,
            columns: 2,
          })),
      }

      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T00:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea(
        {
          start: new Date('2021-01-01T00:00:00Z'),
          days: 2,
          height: 100,
          width: 100,
          dayPaddingRight: 12,
          events: [event],
        },
        arranger
      )

      const [block] = area.getEventBlocks()

      expect(block.width).toBe(19)
    })

    it('returns the correct left when the item is arranged into a specific column and a day padding right is provided', () => {
      const arranger: IArranger = {
        arrange: (items: any[]) =>
          items.map(item => ({
            item,
            column: 2,
            columns: 2,
          })),
      }

      const event: Event = {
        id: '1',
        start: new Date('2021-01-02T00:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea(
        {
          start: new Date('2021-01-01T00:00:00Z'),
          days: 2,
          height: 100,
          width: 100,
          dayPaddingRight: 12,
          events: [event],
        },
        arranger
      )

      const [block] = area.getEventBlocks()

      expect(block.left).toBe(69)
    })

    it('returns the correct width when an event event padding is provided', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-01T13:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        blockPadding: 2,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.width).toBe(98)
    })

    it('returns the correct height when an event event padding is provided', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T00:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        blockPadding: 2,
        events: [event],
      })

      const [block] = area.getEventBlocks()

      expect(block.height).toBe(48)
    })

    it('returns two blocks for an event spanning twe days in the area', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T06:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
      })

      const blocks = area.getEventBlocks()

      expect(blocks).toHaveLength(2)

      expect(blocks[0].event.start).toEqual(new Date('2021-01-01T12:00:00Z'))
      expect(blocks[0].event.end).toEqual(new Date('2021-01-02T06:00:00Z'))
      expect(blocks[0].top).toBe(50)
      expect(blocks[0].height).toBe(50)

      expect(blocks[0].event.start).toEqual(new Date('2021-01-01T12:00:00Z'))
      expect(blocks[0].event.end).toEqual(new Date('2021-01-02T06:00:00Z'))
      expect(blocks[1].top).toBe(0)
      expect(blocks[1].height).toBe(25)
    })

    it('only returns blocks for event parts inside the area', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T00:00:00Z'),
        end: new Date('2021-01-04T00:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-02T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
      })

      const blocks = area.getEventBlocks()

      expect(blocks).toHaveLength(2)
      expect(blocks[0].top).toBe(0)
      expect(blocks[0].height).toBe(100)
      expect(blocks[1].top).toBe(0)
      expect(blocks[1].height).toBe(100)
    })

    it('returns a transparent and a floating block when an event is being dragged', () => {
      const update: EventUpdate = {
        eventId: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T00:00:00Z'),
        type: 'drag',
      }

      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T00:00:00Z'),
        end: new Date('2021-01-01T12:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
        update,
      })

      const [transparentBlock, draggingBlock] = area.getEventBlocks()

      expect(transparentBlock.key).toBe('1_0')
      expect(transparentBlock.isFloating).toBe(false)
      expect(transparentBlock.isTransparent).toBe(true)
      expect(transparentBlock.top).toBe(0)
      expect(transparentBlock.height).toBe(50)

      expect(draggingBlock.key).toBe('1_0_drag')
      expect(draggingBlock.isFloating).toBe(true)
      expect(draggingBlock.isTransparent).toBe(false)
      expect(draggingBlock.top).toBe(50)
      expect(draggingBlock.height).toBe(50)
    })

    it('returns two transparent and two floating blocks when a multi-day event is being dragged', () => {
      const update: EventUpdate = {
        eventId: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
        type: 'drag',
      }

      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T06:00:00Z'),
        end: new Date('2021-01-02T06:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
        update,
      })

      const [
        transparentBlock1,
        transparentBlock2,
        draggingBlock1,
        draggingBlock2,
      ] = area.getEventBlocks()

      expect(transparentBlock1.key).toBe('1_0')
      expect(transparentBlock1.isFloating).toBe(false)
      expect(transparentBlock1.isTransparent).toBe(true)
      expect(transparentBlock1.top).toBe(25)
      expect(transparentBlock1.height).toBe(75)

      expect(transparentBlock2.key).toBe('1_1')
      expect(transparentBlock2.isFloating).toBe(false)
      expect(transparentBlock2.isTransparent).toBe(true)
      expect(transparentBlock2.top).toBe(0)
      expect(transparentBlock2.height).toBe(25)

      expect(draggingBlock1.key).toBe('1_0_drag')
      expect(draggingBlock1.isFloating).toBe(true)
      expect(draggingBlock1.isTransparent).toBe(false)
      expect(draggingBlock1.top).toBe(50)
      expect(draggingBlock1.height).toBe(50)

      expect(draggingBlock2.key).toBe('1_1_drag')
      expect(draggingBlock2.isFloating).toBe(true)
      expect(draggingBlock2.isTransparent).toBe(false)
      expect(draggingBlock2.top).toBe(0)
      expect(draggingBlock2.height).toBe(50)
    })

    it('returns a unique key for each block', () => {
      const event1: Event = {
        id: '1',
        start: new Date('2021-01-01T00:00:00Z'),
        end: new Date('2021-01-01T12:00:00Z'),
      }

      const event2: Event = {
        id: '2',
        start: new Date('2021-01-01T00:00:00Z'),
        end: new Date('2021-01-01T12:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
        events: [event1, event2],
      })

      const [block1, block2] = area.getEventBlocks()

      expect(block1.key).toBe('1_0')
      expect(block2.key).toBe('2_0')
    })

    it('returns a unique key for each block of a multi day event', () => {
      const event: Event = {
        id: '1',
        start: new Date('2021-01-01T12:00:00Z'),
        end: new Date('2021-01-02T12:00:00Z'),
      }

      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
        events: [event],
      })

      const [block1, block2] = area.getEventBlocks()

      expect(block1.key).toBe('1_0')
      expect(block2.key).toBe('1_1')
    })
  })

  describe('getDateForPosition', () => {
    it('returns the start date for top left', () => {
      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
      })

      const date = area.getDateForPosition(0, 0)

      expect(date).toEqual(new Date('2021-01-01T00:00:00Z'))
    })

    it('returns the correct date for top right', () => {
      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 1,
        height: 100,
        width: 100,
      })

      const date = area.getDateForPosition(0, 100)

      expect(date).toEqual(new Date('2021-01-02T00:00:00Z'))
    })

    it('returns the correct date in the second day', () => {
      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
      })

      const date = area.getDateForPosition(75, 50)

      expect(date).toEqual(new Date('2021-01-02T12:00:00Z'))
    })

    it('returns the correct date for a block left the area', () => {
      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
      })

      const date = area.getDateForPosition(-50, 50)

      expect(date).toEqual(new Date('2020-12-31T12:00:00Z'))
    })

    it('returns the correct date for a block right of the area', () => {
      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
      })

      const date = area.getDateForPosition(150, 50)

      expect(date).toEqual(new Date('2021-01-04T12:00:00Z'))
    })

    it('returns the correct date for a block above the area', () => {
      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
      })

      const date = area.getDateForPosition(50, -50)

      expect(date).toEqual(new Date('2021-01-01T12:00:00Z'))
    })

    it('returns the correct date for a block below the area', () => {
      const area = new EventArea({
        start: new Date('2021-01-01T00:00:00Z'),
        days: 2,
        height: 100,
        width: 100,
      })

      const date = area.getDateForPosition(50, 150)

      expect(date).toEqual(new Date('2021-01-03T12:00:00Z'))
    })
  })
})
