import classNames from 'classnames'

export interface TabOption<TValue> {
  id?: string
  label: string
  value: TValue
}

export interface TabsProps<TValue> {
  options: TabOption<TValue>[]
  value?: TValue
  onChange?: (value: TValue) => void
}

export function Tabs<TValue>(props: TabsProps<TValue>) {
  return (
    <div className="flex gap-0.5 p-0.5 rounded-full border-2 border-black/15 dark:border-white/15">
      {props.options.map(option => (
        <button
          key={option.id || option.label}
          className={classNames(
            'cursor-pointer text-sm px-4 py-1 rounded-full border-2',
            props.value === option.value
              ? 'text-white bg-blue-500 border-blue-500 dark:border-blue-600 dark:bg-blue-600'
              : 'border-transparent hover:bg-neutral-200 hover:border-neutral-200 dark:hover:bg-neutral-700 dark:hover:border-neutral-700'
          )}
          onClick={() => props.onChange?.(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
