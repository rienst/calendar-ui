import classNames from 'classnames'
import { format, Locale } from 'date-fns'
import { DragEventHandler } from 'react'

export interface EventViewProps {
  title: string
  start: Date
  end: Date
  top: number
  left: number
  width: number
  height: number
  minHeight?: number
  isFloating?: boolean
  isTransparent?: boolean
  locale?: Locale
  isMovable?: boolean
  isResizable?: boolean
  onDrag?: DragEventHandler<HTMLDivElement>
  onDragStart?: DragEventHandler<HTMLDivElement>
  onDragEnd?: DragEventHandler<HTMLDivElement>
  onResizeBarDrag?: DragEventHandler<HTMLDivElement>
  onResizeBarDragStart?: DragEventHandler<HTMLDivElement>
  onResizeBarDragEnd?: DragEventHandler<HTMLDivElement>
}

export function EventView(props: EventViewProps) {
  return (
    <div
      draggable={props.isMovable}
      onDragStart={props.onDragStart}
      onDrag={props.onDrag}
      onDragEnd={props.onDragEnd}
      className={classNames(
        'flex absolute select-none text-sm bg-blue-500 overflow-hidden text-white pl-1.5 py-0.5 rounded-md h-full',
        props.height >= 36 ? 'flex-col' : 'gap-2',
        props.isFloating
          ? 'shadow-lg shadow-black/50 z-30 ring ring-white dark:ring-black'
          : 'z-10',
        props.isTransparent ? 'opacity-50' : 'cursor-pointer'
      )}
      style={{
        top: props.top,
        left: props.left,
        width: props.width,
        height: props.height,
        minHeight: props.minHeight,
      }}
    >
      <div className="shrink-0 font-semibold overflow-hidden text-nowrap">
        {props.title}
      </div>

      <div className="shrink-0 whitespace-nowrap">
        {format(props.start, 'p', { locale: props.locale })} -{' '}
        {format(props.end, 'p', { locale: props.locale })}
      </div>

      {props.isResizable && (
        <div
          draggable
          className="absolute left-0 w-full bottom-0 h-2 cursor-ns-resize"
          onDragStart={props.onResizeBarDragStart}
          onDrag={props.onResizeBarDrag}
          onDragEnd={props.onResizeBarDragEnd}
        />
      )}
    </div>
  )
}
