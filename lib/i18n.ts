// i18n setup - Language framework (no translations yet)

export type Locale = "en" | "es" | "fr" | "de" | "ja" | "zh"

export const DEFAULT_LOCALE: Locale = "en"

export const SUPPORTED_LOCALES: Locale[] = ["en", "es", "fr", "de", "ja", "zh"]

export interface Translations {
  [key: string]: string | Translations
}

// Placeholder for future translations
export const translations: Record<Locale, Translations> = {
  en: {},
  es: {},
  fr: {},
  de: {},
  ja: {},
  zh: {},
}

/**
 * Get current locale from localStorage or default
 */
export function getLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  const stored = localStorage.getItem("storyproof_locale") as Locale
  return stored && SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE
}

/**
 * Set locale
 */
export function setLocale(locale: Locale): void {
  if (typeof window === "undefined") return
  if (SUPPORTED_LOCALES.includes(locale)) {
    localStorage.setItem("storyproof_locale", locale)
    document.documentElement.setAttribute("lang", locale)
  }
}

/**
 * Initialize i18n
 */
export function initI18n(): void {
  if (typeof window === "undefined") return
  const locale = getLocale()
  document.documentElement.setAttribute("lang", locale)
}

