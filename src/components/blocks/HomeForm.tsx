import { SendProjectFields } from '@/components/popups/PopupHost'
import { home } from '@/data/home'

/**
 * «03 Отправьте проект…» (Desktop 113:79, Mobile 117:253). Фон color_bg-cream.
 * Поля — те же, что в попапе «Отправить проект». Один DOM, раскладка — grid-template-areas.
 * Mobile: pt 32, px 12; номер + h2 в строку (gap 16) → через 24 линия 1px bg-stone → через 32 форма.
 * xl: pt 72, pl container-padding; колонки 640 | линия 1px bg-stone-light | форма 537 (с x 743):
 * номер с y 133, h2 392 с отступом 158 через 11.
 */
export function HomeForm() {
  const { title } = home.form
  return (
    <section
      aria-label={title}
      className="bg-bg-cream px-3 pt-8 xl:px-container-padding xl:pt-[72px]"
    >
      <div className="grid [grid-template-areas:'head'_'line'_'form'] xl:grid-cols-[640px_1px_639px] xl:[grid-template-areas:'head_line_form']">
        <div className="flex items-center gap-4 [grid-area:head] xl:flex-col xl:items-start xl:gap-[11px] xl:pt-[133px]">
          <span className="text-numeral-type text-text-numeral" aria-hidden>
            03
          </span>
          <h2 className="flex-1 text-h2 text-text-heading uppercase xl:w-[550px] xl:flex-none xl:pl-[158px]">
            {title}
          </h2>
        </div>
        <span
          className="mt-6 mb-8 h-px bg-bg-stone [grid-area:line] xl:m-0 xl:h-auto xl:bg-bg-stone-light"
          aria-hidden
        />
        <div className="[grid-area:form] xl:ml-[102px]">
          <SendProjectFields idPrefix="home" />
        </div>
      </div>
    </section>
  )
}
