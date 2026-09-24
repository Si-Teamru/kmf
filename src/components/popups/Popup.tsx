'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { cn, IconButtonClose } from '@/components/ui'

import { lockScroll } from './lockScroll'

/**
 * Каркас попапа (секция «Попапы и лайтбокс — к вёрстке», страница 22:2) на нативном `<dialog>`:
 * фокус внутри, Esc и клик по затемнению закрывают, прокрутка страницы заблокирована.
 * Затемнение — color_bg-graphite 60%, панель — color_bg-cream, на md+ срез нижнего правого угла
 * 101×65 (как у карточки проекта). Появление: fade затемнения + панель снизу вверх 24px, 0.3s.
 *
 * `variant` на мобильном (до md): `screen` — на весь экран (формы), `sheet` — снизу,
 * max-height 85vh с прокруткой («Весь отзыв»). Ширину и отступы панели задаёт `className`.
 * Крестик — в правом верхнем углу: 12px от края на мобильном, 16px на md+.
 */
export function Popup({
  open,
  onClose,
  label,
  variant = 'screen',
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  variant?: 'screen' | 'sheet'
  className?: string
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  useEffect(() => (open ? lockScroll() : undefined), [open])

  return (
    <dialog
      ref={dialog}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        'm-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 open:flex open:flex-col',
        'backdrop:animate-[fade-in_0.3s_ease-out] backdrop:bg-bg-graphite/60',
        variant === 'screen' ? 'bg-bg-cream md:bg-transparent' : '',
      )}
    >
      <div
        className={cn(
          'relative w-full shrink-0 animate-[popup-in_0.3s_ease-out] bg-bg-cream md:m-auto md:[clip-path:polygon(0_0,100%_0,100%_calc(100%-65px),calc(100%-101px)_100%,0_100%)]',
          variant === 'screen'
            ? 'min-h-full md:min-h-0'
            : 'mt-auto max-h-[85dvh] overflow-y-auto md:max-h-none md:overflow-visible',
          className,
        )}
      >
        {children}
        {/* autoFocus — иначе браузер фокусирует первое поле и прокручивает длинную форму вниз. */}
        <IconButtonClose
          autoFocus
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4"
        />
      </div>
    </dialog>
  )
}
