import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CONSENT_EVENT, CONSENT_VERSION, hasConsent, readConsent, saveConsent } from './consent'

const setRaw = (value: string) => (document.cookie = `kmf_consent=${value}; path=/`)

describe('согласие на текстовые файлы данных', () => {
  beforeEach(() => {
    document.cookie = 'kmf_consent=; max-age=0; path=/'
  })

  it('без выбора — баннер нужен', () => {
    expect(readConsent()).toBeNull()
    expect(hasConsent('analytics')).toBe(false)
  })

  it('сохраняет выбор по категориям и сообщает о нём', () => {
    const onChange = vi.fn()
    window.addEventListener(CONSENT_EVENT, onChange)
    saveConsent({ analytics: true, advertising: false })
    window.removeEventListener(CONSENT_EVENT, onChange)

    expect(onChange).toHaveBeenCalledOnce()
    expect(readConsent()).toMatchObject({
      analytics: true,
      advertising: false,
      version: CONSENT_VERSION,
    })
    expect(hasConsent('analytics')).toBe(true)
    expect(hasConsent('advertising')).toBe(false)
  })

  it('выбор старой версии не считается — спросить снова', () => {
    setRaw(encodeURIComponent(JSON.stringify({ analytics: true, version: CONSENT_VERSION - 1 })))
    expect(readConsent()).toBeNull()
    expect(hasConsent('analytics')).toBe(false)
  })

  it('испорченный файл не роняет страницу', () => {
    setRaw('%7Bне-json')
    expect(readConsent()).toBeNull()
  })
})
