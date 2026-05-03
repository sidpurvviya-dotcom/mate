'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem('mate-theme') as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
      document.documentElement.setAttribute('data-theme', storedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('mate-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Prevent FOUC rendering mismatch by returning children directly, but
  // if you want to avoid hydration errors entirely on the server vs client:
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  // If used outside of provider, just return defaults to avoid crashing
  if (context === undefined) {
    return { theme: 'light' as Theme, toggleTheme: () => {} }
  }
  return context
}
