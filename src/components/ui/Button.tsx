import { ArrowSquare } from './ArrowSquare'
import { cn } from './cn'
import { Pressable, type PressableProps } from './Pressable'

/**
 * Button / CTA (Figma 12:21): пилюля + квадрат со стрелкой.
 * Red — «Отправить проект» (41px, красный квадрат), Outline — «Заказать проект» в панели плана (45px).
 * `fullWidth` — пилюля растягивается (в форме).
 * Hover (State=Hover в ките): пилюля с рамкой заливается color_accent-red, текст белый; квадрат —
 * стрелка поворачивается на 45° (→), красный темнеет на 10% (ArrowSquare).
 */
export function ButtonCta({
  arrow = 'red',
  fullWidth = false,
  className,
  children,
  ...props
}: PressableProps & { arrow?: 'red' | 'outline'; fullWidth?: boolean }) {
  const outline = arrow === 'outline'
  return (
    <Pressable
      {...props}
      className={cn('group items-center', fullWidth ? 'flex w-full' : 'inline-flex', className)}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full border-[1.2px] border-text-button px-7 text-button-type whitespace-nowrap text-text-button transition-colors duration-200 group-hover:border-accent-red group-hover:bg-accent-red group-hover:text-text-inverse',
          outline ? 'h-[45px]' : 'h-[41px]',
          fullWidth && 'flex-1',
        )}
      >
        {children}
      </span>
      <ArrowSquare variant={outline ? 'outline' : 'red'} />
    </Pressable>
  )
}

/**
 * Button / Card (Figma 12:34): кнопки карточки проекта 156×40.
 * Outline — рамка 1px; Dark — графитовая пилюля; Sand — «Все проекты» со стрелкой:
 * иконка 18px прижата к правому краю (right −7.5 / top −10) — выступает за правый верхний угол
 * на любой ширине кнопки; при наведении стрелка поворачивается на 45° (→).
 * Hover (State=Hover в ките): у всех стилей заливка color_accent-red и белый текст.
 * Отступы: py 8, px 4 — чтобы «Смотреть проект» помещался в мобильную кнопку 140.
 * `size` — классы размера (по умолчанию `h-10 w-[156px]`): мобильная карточка 140, «Все проекты» 240×36.
 */
export function ButtonCard({
  variant = 'outline',
  size = 'h-10 w-[156px]',
  className,
  children,
  ...props
}: PressableProps & { variant?: 'outline' | 'dark' | 'sand'; size?: string }) {
  return (
    <Pressable
      {...props}
      className={cn(
        'relative inline-flex items-center justify-center px-1 py-2 text-button-type whitespace-nowrap transition-colors duration-200',
        size,
        variant === 'outline' &&
          'border border-text-primary text-text-primary hover:border-accent-red hover:bg-accent-red hover:text-text-inverse',
        variant === 'dark' && 'rounded-full bg-bg-graphite text-text-inverse hover:bg-accent-red',
        variant === 'sand' &&
          'group bg-bg-sand-light text-text-button hover:bg-accent-red hover:text-text-inverse',
        className,
      )}
    >
      {children}
      {variant === 'sand' && (
        <ArrowSquare variant="external" className="absolute -top-2.5 -right-[7.5px]" />
      )}
    </Pressable>
  )
}
