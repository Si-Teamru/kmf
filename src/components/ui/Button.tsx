import { cn } from './cn'
import { Icon } from './Icon'
import { Pressable, type PressableProps } from './Pressable'

/**
 * Button / CTA (Figma 12:21): пилюля + квадрат со стрелкой.
 * Red — «Отправить проект» (41px, красный квадрат), Outline — «Заказать проект» в панели плана (45px).
 * `fullWidth` — пилюля растягивается (в форме).
 * Hover по киту: пилюля заливается color_text-button с белым текстом, квадрат темнеет на 10%.
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
          'inline-flex items-center justify-center overflow-hidden rounded-full border-[1.2px] border-text-button px-7 text-button-type whitespace-nowrap text-text-button transition-colors duration-200 group-hover:bg-text-button group-hover:text-text-inverse',
          outline ? 'h-[45px]' : 'h-[41px]',
          fullWidth && 'flex-1',
        )}
      >
        {children}
      </span>
      <Icon
        name={outline ? 'arrow-outline-45' : 'cta-arrow-red'}
        className="shrink-0 transition-[filter] duration-200 group-hover:brightness-90"
      />
    </Pressable>
  )
}

/**
 * Button / Card (Figma 12:34): кнопки карточки проекта 156×40.
 * Outline — рамка 1px; Dark — графитовая пилюля; Sand — «Все проекты» со стрелкой:
 * иконка 18px на left 145.5 / top −10 (у 156px — выступает за правый угол, у 240px — над кнопкой).
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
        'relative inline-flex items-center justify-center p-2 text-button-type whitespace-nowrap transition-colors duration-200',
        size,
        variant === 'outline' &&
          'border border-text-primary text-text-primary hover:bg-text-primary hover:text-text-inverse',
        variant === 'dark' && 'rounded-full bg-bg-graphite text-text-inverse hover:bg-text-button',
        variant === 'sand' && 'bg-bg-sand-light text-text-button hover:bg-bg-sand',
        className,
      )}
    >
      {children}
      {variant === 'sand' && (
        <Icon name="external-arrow-18" className="absolute -top-2.5 left-[145.5px]" />
      )}
    </Pressable>
  )
}
