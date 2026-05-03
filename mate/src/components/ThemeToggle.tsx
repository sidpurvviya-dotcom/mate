'use client'
import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-icon"
      aria-label="Toggle Dark Mode"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{ padding: '0.5rem', borderRadius: '50%' }}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-warning" />
      ) : (
        <Moon size={20} className="text-secondary-color" />
      )}
    </button>
  )
}
