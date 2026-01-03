"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("flex w-16 h-8 p-1 rounded-full", className)}>
        <div className="w-6 h-6 rounded-full bg-muted" />
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark 
          ? "bg-zinc-950 border border-zinc-800" 
          : "bg-white border border-zinc-200",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setTheme(isDark ? "light" : "dark")
        }
      }}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <div className="flex justify-between items-center w-full relative">
        <div
          className={cn(
            "absolute flex justify-center items-center w-6 h-6 rounded-full transition-all duration-300 z-10",
            isDark 
              ? "left-0 bg-zinc-800" 
              : "left-8 bg-gray-200"
          )}
        >
          {isDark ? (
            <Moon 
              className="w-4 h-4 text-white" 
              strokeWidth={1.5}
            />
          ) : (
            <Sun 
              className="w-4 h-4 text-gray-700" 
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-opacity duration-300",
            isDark 
              ? "opacity-100" 
              : "opacity-0"
          )}
        >
          <Sun 
            className="w-4 h-4 text-gray-500" 
            strokeWidth={1.5}
          />
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-opacity duration-300",
            isDark 
              ? "opacity-0" 
              : "opacity-100"
          )}
        >
          <Moon 
            className="w-4 h-4 text-black" 
            strokeWidth={1.5}
          />
        </div>
      </div>
    </div>
  )
}

