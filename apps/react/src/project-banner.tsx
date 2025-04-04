export function ProjectBanner() {
  return (
    <div className="bg-neutral-100 border-b border-neutral-300 dark:text-white dark:border-neutral-700 py-2 px-4 text-sm dark:bg-neutral-800 flex items-center gap-4">
      <h1 className="font-semibold">
        <a
          className="hover:underline underline-offset-2"
          href="https://github.com/rienst/calendar-ui"
          target="_blank"
        >
          rienst/calendar-ui
        </a>
      </h1>

      <p>
        You're viewing the React version, check out the{' '}
        <a
          href="https://rienst.github.io/calendar-ui/angular/"
          target="_blank"
          className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
        >
          Angular version
        </a>{' '}
        or the{' '}
        <a
          href="https://github.com/rienst/calendar-ui"
          target="_blank"
          className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
        >
          source on GitHub
        </a>
        .
      </p>
    </div>
  )
}
