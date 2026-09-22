import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'
import {
  applyTheme,
  LANGUAGE_DIRECTION,
  MEDIA,
  resolveContrast,
  resolveTheme,
  transitionTheme,
  STORAGE_KEYS,
  type ContrastPreference,
  type Language,
  type ResolvedContrast,
  type ResolvedTheme,
  type ThemeMode,
} from './theme'

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored && (allowed as readonly string[]).includes(stored)) {
      return stored as T
    }
  } catch {
    // Private mode, or storage blocked. The default is still correct.
  }
  return fallback
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Non-fatal: the choice just will not survive a reload.
  }
}

const MODES = ['light', 'dark', 'system'] as const
const CONTRASTS = ['standard', 'medium', 'high', 'system'] as const
const LANGUAGES = ['en', 'ar'] as const

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    readStored(STORAGE_KEYS.mode, MODES, 'system'),
  )
  const [contrast, setContrastState] = useState<ContrastPreference>(() =>
    readStored(STORAGE_KEYS.contrast, CONTRASTS, 'system'),
  )
  const [language, setLanguageState] = useState<Language>(() =>
    readStored(STORAGE_KEYS.language, LANGUAGES, 'en'),
  )

  /**
   * The OS preferences, mirrored into state so a change re-renders. Holding
   * the resolved values rather than a change counter keeps the derivation
   * below a plain expression - there is nothing to memoise and nothing for the
   * dependency linter to disagree with.
   */
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    resolveTheme('system'),
  )
  const [systemContrast, setSystemContrast] = useState<ResolvedContrast>(() =>
    resolveContrast('system'),
  )

  useEffect(() => {
    const queries = [matchMedia(MEDIA.dark), matchMedia(MEDIA.moreContrast)]
    const sync = () => {
      setSystemTheme(resolveTheme('system'))
      setSystemContrast(resolveContrast('system'))
    }
    // Re-read once on mount: the preference can change between the initial
    // render and the effect firing.
    sync()
    queries.forEach((query) => query.addEventListener('change', sync))
    return () =>
      queries.forEach((query) => query.removeEventListener('change', sync))
  }, [])

  const resolvedTheme = mode === 'system' ? systemTheme : mode
  const resolvedContrast = contrast === 'system' ? systemContrast : contrast

  useEffect(() => {
    applyTheme({ theme: resolvedTheme, contrast: resolvedContrast, language })
  }, [resolvedTheme, resolvedContrast, language])

  /*
   * A scheme change is wrapped in a View Transition, so every surface
   * cross-fades instead of repainting on a single frame - a whole page
   * changing colour at once is exactly what makes a theme switch read as a
   * flash. Timing lives in components/theme-transition.css.
   *
   * Two things have to happen before the callback returns, because
   * startViewTransition snapshots the DOM the moment it does:
   *
   *   flushSync    React would otherwise batch the state update past the
   *                snapshot, and nothing would appear to have changed.
   *   applyTheme   the attributes are normally written by the effect above,
   *                which is passive and runs after the snapshot. Writing them
   *                here too makes the change part of the transition; the
   *                effect then re-runs with the same values and is a no-op.
   */
  const setMode = useCallback(
    (next: ThemeMode) => {
      transitionTheme(() => {
        flushSync(() => setModeState(next))
        applyTheme({
          theme: next === 'system' ? systemTheme : next,
          contrast: resolvedContrast,
          language,
        })
      })
      writeStored(STORAGE_KEYS.mode, next)
    },
    [systemTheme, resolvedContrast, language],
  )

  const setContrast = useCallback(
    (next: ContrastPreference) => {
      transitionTheme(() => {
        flushSync(() => setContrastState(next))
        applyTheme({
          theme: resolvedTheme,
          contrast: next === 'system' ? systemContrast : next,
          language,
        })
      })
      writeStored(STORAGE_KEYS.contrast, next)
    },
    [resolvedTheme, systemContrast, language],
  )

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    writeStored(STORAGE_KEYS.language, next)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      contrast,
      language,
      resolvedTheme,
      resolvedContrast,
      direction: LANGUAGE_DIRECTION[language],
      setMode,
      setContrast,
      setLanguage,
    }),
    [
      mode,
      contrast,
      language,
      resolvedTheme,
      resolvedContrast,
      setMode,
      setContrast,
      setLanguage,
    ],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
