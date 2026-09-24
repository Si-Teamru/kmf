import { cn } from './cn'
import { Icon } from './Icon'
import { Pressable, type PressableProps } from './Pressable'

/** Hover ссылок по киту: opacity 0.7, transition 0.2s. */
const linkBase =
  'inline-flex items-center whitespace-nowrap transition-opacity duration-200 hover:opacity-70'

/** Link / Arrow (12:44): «Записаться в выставочный зал ———→», accent-copper на всех ширинах. */
export function LinkArrow({ className, children, ...props }: PressableProps) {
  return (
    <Pressable
      {...props}
      className={cn(linkBase, 'gap-[7px] text-link-accent text-accent-copper', className)}
    >
      {children}
      <Icon name="link-arrow-98" />
    </Pressable>
  )
}

/** Link / View All Photos (12:48): «Посмотреть все фото ——→». */
export function LinkViewAll({ className, children, ...props }: PressableProps) {
  return (
    <Pressable
      {...props}
      className={cn(linkBase, 'gap-2 text-caption-s text-text-primary', className)}
    >
      {children}
      <Icon name="view-all-arrow" />
    </Pressable>
  )
}

/** Link / Caps Dot (12:52): «ВСЕ ПРОЕКТЫ ●». */
export function LinkCapsDot({ className, children, ...props }: PressableProps) {
  return (
    <Pressable
      {...props}
      className={cn(linkBase, 'gap-2.5 text-overline-s text-text-primary uppercase', className)}
    >
      {children}
      <Icon name="dot-red" />
    </Pressable>
  )
}

/** Link / Caps Plus (12:55): «ВЕСЬ ОТЗЫВ +». */
export function LinkCapsPlus({ className, children, ...props }: PressableProps) {
  return (
    <Pressable
      {...props}
      className={cn(linkBase, 'gap-2 text-overline text-text-button uppercase', className)}
    >
      {children}
      <Icon name="plus-15" />
    </Pressable>
  )
}

/** Link / Watch Video (12:61): «СМОТРЕТЬ ВИДЕО +» — белая, поверх тёмной плашки/видео. */
export function LinkWatchVideo({ className, children, ...props }: PressableProps) {
  return (
    <Pressable
      {...props}
      className={cn(linkBase, 'gap-1.5 text-overline-s text-text-inverse uppercase', className)}
    >
      {children}
      <Icon name="plus-11" />
    </Pressable>
  )
}

/** Link / Nav (12:67): пункт меню шапки (Проекты, Контакты, телефон), между пунктами 24px. */
export function NavLink({ className, ...props }: PressableProps) {
  return (
    <Pressable {...props} className={cn(linkBase, 'text-nav-link text-text-primary', className)} />
  )
}
