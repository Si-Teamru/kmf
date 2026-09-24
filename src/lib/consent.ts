/**
 * Согласие на текстовые файлы данных (cookie) по 152-ФЗ.
 * Выбор хранится в одном основном файле `kmf_consent` на 12 месяцев: категории, дата, версия.
 * Аналитические и рекламные скрипты подключать только при `hasConsent('analytics' | 'advertising')`
 * и подписываться на `CONSENT_EVENT` — пользователь может изменить выбор в любой момент.
 */

export type ConsentCategory = 'analytics' | 'advertising'

export type Consent = Record<ConsentCategory, boolean> & {
  /** Когда сделан выбор (ISO). */
  date: string
  /** Версия набора категорий и текста; при изменении — спросить снова. */
  version: number
}

/** Увеличить, если поменялись категории или политика: баннер покажется всем снова. */
export const CONSENT_VERSION = 1
export const CONSENT_EVENT = 'kmf:consent'

const COOKIE = 'kmf_consent'
const MAX_AGE = 60 * 60 * 24 * 365

/** Сырое значение файла согласия ('' — выбора нет). Снимок для useSyncExternalStore. */
export function consentSnapshot() {
  return (
    document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1) ?? ''
  )
}

/** Подписка на изменение выбора (для useSyncExternalStore). */
export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange)
  return () => window.removeEventListener(CONSENT_EVENT, onChange)
}

export function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null
  const raw = consentSnapshot()
  if (!raw) return null
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as Consent
    return value.version === CONSENT_VERSION ? value : null
  } catch {
    return null
  }
}

export function saveConsent(choice: Record<ConsentCategory, boolean>) {
  const value: Consent = { ...choice, date: new Date().toISOString(), version: CONSENT_VERSION }
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(value))}; max-age=${MAX_AGE}; path=/; SameSite=Lax`
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: value }))
  return value
}

export function hasConsent(category: ConsentCategory) {
  return readConsent()?.[category] === true
}
