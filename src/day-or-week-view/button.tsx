import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export type ButtonProps = Omit<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  'className'
>

export function Button(props: ButtonProps) {
  return (
    <button
      className="cursor-pointer text-sm px-4 py-2 rounded-full border-2 border-black/15 dark:border-white/15 hover:bg-black/10 dark:hover:bg-white/10"
      {...props}
    />
  )
}
