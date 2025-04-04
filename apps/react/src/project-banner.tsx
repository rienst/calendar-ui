export function ProjectBanner() {
  return (
    <p className="bg-[#bbe2f0] dark:bg-[#004760] dark:text-white py-2 px-4 text-center text-sm">
      This is a calendar UI built using React. Check out the{' '}
      <a
        href="https://rienst.github.io/calendar-ui/angular/"
        target="_blank"
        className="underline underline-offset-2"
      >
        Angular version
      </a>{' '}
      or the{' '}
      <a
        href="https://github.com/rienst/calendar-ui"
        target="_blank"
        className="underline underline-offset-2"
      >
        source on GitHub
      </a>
      .
    </p>
  )
}
