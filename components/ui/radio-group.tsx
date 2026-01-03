"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export function RadioGroup({
  value,
  onValueChange,
  children,
  className,
}: {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </RadioGroupContext.Provider>
  )
}

export function RadioGroupItem({
  value,
  id,
}: {
  value: string
  id: string
}) {
  const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext)

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={selectedValue === value}
      onChange={() => onValueChange?.(value)}
      className="w-4 h-4 text-accent border-border focus:ring-accent focus:ring-2"
    />
  )
}

