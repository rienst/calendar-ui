import { Root, Portal, Content, Close, Overlay } from '@radix-ui/react-dialog'
import { format, Locale } from 'date-fns'

export interface EventInfoModalProps {
  isOpen: boolean
  title?: string
  start: Date
  end: Date
  locale?: Locale
  onTitleChange?: (title: string) => void
  onClose?: () => void
}

export function EventInfoModal(props: EventInfoModalProps) {
  return (
    <Root onOpenChange={open => !open && props.onClose?.()} open={props.isOpen}>
      <Portal>
        <div className="px-6 w-full max-w-screen-sm fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <Content className="relative flex flex-col gap-2 p-10 rounded-xl bg-white dark:bg-neutral-800 shadow-2xl shadow-black/50">
            <input
              className="border-b-2 border-transparent text-2xl w-full pb-1 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="(No title)"
              value={props.title}
              onChange={e => props.onTitleChange?.(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && props.onClose?.()}
            />

            <div>
              {format(props.start, 'p', { locale: props.locale })} -{' '}
              {format(props.end, 'p', { locale: props.locale })}
            </div>

            <Close className="w-12 h-12 rounded-xl absolute top-0 right-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className="w-5 h-5"
              >
                <path
                  fill="currentColor"
                  d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
                />
              </svg>
            </Close>
          </Content>
        </div>

        <Overlay className="fixed inset-0 bg-black/15 z-40" />
      </Portal>
    </Root>
  )
}
