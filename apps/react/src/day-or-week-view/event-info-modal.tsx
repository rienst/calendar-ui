import { Root, Portal, Content, Close, Overlay } from '@radix-ui/react-dialog'
import { format, Locale } from 'date-fns'

export interface EventInfoModalProps {
  isOpen: boolean
  title?: string
  start: Date
  end: Date
  locale?: Locale
  onTitleChange?: (title: string) => void
  onDelete?: () => void
  onClose?: () => void
}

export function EventInfoModal(props: EventInfoModalProps) {
  return (
    <Root onOpenChange={open => !open && props.onClose?.()} open={props.isOpen}>
      <Portal>
        <div className="px-6 w-full max-w-screen-sm fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-60">
          <Content className="border-2 border-transparent relative flex flex-col gap-2 p-12 rounded-xl bg-white/75 dark:bg-neutral-800/75 shadow-2xl shadow-black/50 dark:border-white/25 backdrop-blur-2xl">
            <input
              className="border-b-2 border-transparent text-2xl w-full pb-1 focus:outline-none focus:border-blue-500 placeholder:text-black/50 dark:focus:border-blue-400 dark:placeholder:text-white/50"
              placeholder="(No title)"
              value={props.title}
              onChange={e => props.onTitleChange?.(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && props.onClose?.()}
            />

            <div>
              {format(props.start, 'p', { locale: props.locale })} -{' '}
              {format(props.end, 'p', { locale: props.locale })}
            </div>

            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-rose-500/15 hover:text-rose-700 dark:hover:bg-rose-500/50 dark:hover:text-white"
                onClick={props.onDelete}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  className="w-5 h-5"
                >
                  <path
                    fill="currentColor"
                    d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"
                  />
                </svg>
              </button>

              <Close className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-neutral-500/15 dark:hover:bg-neutral-400/25">
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
            </div>
          </Content>
        </div>

        <Overlay className="fixed inset-0 bg-black/15 z-50" />
      </Portal>
    </Root>
  )
}
