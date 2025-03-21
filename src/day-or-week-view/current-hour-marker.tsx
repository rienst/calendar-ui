import { useEffect, useState } from 'react'

export function CurrentHourMarker() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutesPassedToday = now.getHours() * 60 + now.getMinutes()

  return (
    <div
      className="absolute top-0 left-0 right-0 h-[2px] bg-red-500 z-20 pointer-events-none dark:bg-red-400"
      style={{
        top: `${(minutesPassedToday / 1440) * 100}%`,
      }}
    >
      <div className="absolute -top-[5px] -left-[6px] w-[12px] h-[12px] bg-red-500 rounded-full dark:bg-red-400" />
    </div>
  )
}
