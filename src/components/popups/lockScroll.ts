/**
 * Блокирует прокрутку страницы под попапом/лайтбоксом. Ширину пропавшей полосы прокрутки
 * компенсирует padding-right, чтобы страница под затемнением не сдвигалась. Возвращает отмену.
 */
export function lockScroll() {
  const root = document.documentElement
  const { overflow, paddingRight } = root.style
  const scrollbar = window.innerWidth - root.clientWidth
  root.style.overflow = 'hidden'
  if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`
  return () => {
    root.style.overflow = overflow
    root.style.paddingRight = paddingRight
  }
}
