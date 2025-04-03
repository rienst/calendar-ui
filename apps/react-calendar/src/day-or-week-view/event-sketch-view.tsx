import { format, Locale } from 'date-fns'

export interface EventSketchViewProps {
  start: Date
  end: Date
  top: number
  left: number
  width: number
  height: number
  locale?: Locale
}

export function EventSketchView(props: EventSketchViewProps) {
  return (
    <div
      className="flex absolute select-none text-sm bg-blue-500 overflow-hidden text-white pl-1.5 py-0.5 rounded-md h-full"
      style={{
        top: props.top,
        left: props.left,
        width: props.width,
        height: props.height,
      }}
    >
      <div className="shrink-0 font-semibold overflow-hidden text-nowrap">
        New event
      </div>

      <div className="shrink-0 whitespace-nowrap">
        {format(props.start, 'p', { locale: props.locale })} -{' '}
        {format(props.end, 'p', { locale: props.locale })}
      </div>
    </div>
  )
}
