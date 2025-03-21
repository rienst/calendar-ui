import classNames from 'classnames'
import { format, Locale } from 'date-fns'
import { useEventTrack } from './event-track'
import { DragEventHandler } from 'react'

export interface EventViewProps {
  title: string
  start: Date
  end: Date
  column: number
  columns: number
  isFloating?: boolean
  isTransparent?: boolean
  draggable?: boolean
  onDrag?: DragEventHandler<HTMLDivElement>
  onDragStart?: DragEventHandler<HTMLDivElement>
  onDragEnd?: DragEventHandler<HTMLDivElement>
  resizable?: boolean
  onResizeBarDrag?: DragEventHandler<HTMLDivElement>
  onResizeBarDragStart?: DragEventHandler<HTMLDivElement>
  onResizeBarDragEnd?: DragEventHandler<HTMLDivElement>
  locale?: Locale
}

export function EventView(props: EventViewProps) {
  const { pxPerMinute, getPositionForEvent } = useEventTrack()

  const eventMinutes = (props.end.getTime() - props.start.getTime()) / 1000 / 60

  const position = getPositionForEvent({
    start: props.start,
    end: props.end,
    column: props.column,
    columns: props.columns,
  })

  if (!position) {
    return null
  }

  return (
    <div
      draggable={props.draggable}
      onDrag={props.onDrag}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      className={classNames(
        'flex absolute cursor-pointer select-none text-sm bg-blue-500 overflow-hidden text-white pl-1.5 py-0.5 rounded-md h-full',
        eventMinutes >= 60 ? 'flex-col' : 'gap-2',
        props.isFloating
          ? 'shadow-lg shadow-black/50 z-30 ring ring-white dark:ring-black'
          : 'z-10',
        props.isTransparent && 'opacity-50'
      )}
      style={{
        ...position,
        minHeight: pxPerMinute * 30,
      }}
    >
      <div className="shrink-0 font-semibold overflow-hidden text-nowrap">
        {props.title}
      </div>

      <div className="shrink-0 whitespace-nowrap">
        {format(props.start, 'p', { locale: props.locale })} -{' '}
        {format(props.end, 'p', { locale: props.locale })}
      </div>

      {props.resizable && (
        <div
          draggable
          onDrag={props.onResizeBarDrag}
          onDragStart={props.onResizeBarDragStart}
          onDragEnd={props.onResizeBarDrag}
          className="absolute left-0 w-full bottom-0 h-2 cursor-ns-resize"
        />
      )}
    </div>
  )
}
