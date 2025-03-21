import classNames from 'classnames'

export interface ArrowButtonsProps {
  onClickPrevious?: () => void
  onClickNext?: () => void
}

export function ArrowButtons(props: ArrowButtonsProps) {
  return (
    <div className="flex items-center">
      {['previous', 'next'].map(direction => (
        <button
          key={direction}
          className={classNames(
            'w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer'
          )}
          onClick={() =>
            direction === 'next'
              ? props.onClickNext?.()
              : props.onClickPrevious?.()
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="w-5 h-5"
          >
            {direction === 'next' ? (
              <path
                fill="currentColor"
                d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"
              />
            ) : (
              <path
                fill="currentColor"
                d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z"
              />
            )}
          </svg>
        </button>
      ))}
    </div>
  )
}
