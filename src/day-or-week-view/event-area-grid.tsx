export interface EventAreaGridProps {
  days: number
  hours: number
}

export function EventAreaGrid(props: EventAreaGridProps) {
  return (
    <>
      {Array.from({ length: props.days }).map((_, count) => (
        <div className="basis-0 grow" key={count}>
          {Array.from({ length: props.hours }).map((_, count) => (
            <div
              className="border-b border-l border-black/15 h-12 dark:border-white/15"
              key={count}
            />
          ))}
        </div>
      ))}
    </>
  )
}
