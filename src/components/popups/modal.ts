import { useEffect, type RefObject } from 'react'

import { lockScroll } from './lockScroll'

/** Открывает и закрывает `<dialog>` по `open` (showModal — фокус внутри, Esc) и блокирует прокрутку страницы. */
export function useModal(ref: RefObject<HTMLDialogElement | null>, open: boolean) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
    return open ? lockScroll() : undefined
  }, [ref, open])
}

/**
 * Перехват кликов по ссылкам в фазе захвата — раньше next/link, который сам сменил бы хэш без
 * hashchange. `handle` получает адрес ссылки и возвращает true, если клик обработан. Возвращает отписку.
 */
export function interceptLinks(handle: (url: URL) => boolean) {
  const onClick = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
    const a = (e.target as Element).closest?.('a[href]')
    if (!(a instanceof HTMLAnchorElement) || !handle(new URL(a.href))) return
    e.preventDefault()
    e.stopPropagation()
  }
  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}
