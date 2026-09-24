'use client'

import { useEffect, useRef, useState } from 'react'

import { LinkCapsPlus, Review } from '@/components/ui'
import { Popup } from '@/components/popups/Popup'
import type { Review as ReviewData } from '@/data/projects'

import { StepDivider } from './StepDivider'

/** Сколько строк цитаты видно в карточке; длиннее — появляется «Весь отзыв +». */
const LINES = 5

/**
 * Review в галерее проекта: цитата обрезается до 5 строк, «ВЕСЬ ОТЗЫВ +» показывается,
 * только если текст длиннее, и открывает попап «Весь отзыв».
 */
export function ProjectReview({ review, className }: { review: ReviewData; className?: string }) {
  const quote = useRef<HTMLQuoteElement>(null)
  const [clamped, setClamped] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = quote.current
    if (!el) return
    const ro = new ResizeObserver(() => setClamped(el.scrollHeight > el.clientHeight + 1))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <Review
        {...review}
        lines={LINES}
        quoteRef={quote}
        more={
          clamped ? <LinkCapsPlus onClick={() => setOpen(true)}>Весь отзыв</LinkCapsPlus> : null
        }
        className={className}
      />
      <Popup
        open={open}
        onClose={() => setOpen(false)}
        label="Отзыв"
        variant="sheet"
        className="md:w-[720px]"
      >
        <ReviewFull review={review} />
      </Popup>
    </>
  )
}

/**
 * «Весь отзыв». Mobile — sheet: px 12, pt 8, pb 40, gap 20; «ОТЗЫВ» на одной линии с крестиком.
 * md+: панель 720, p 64, gap 24. Дальше Step Divider, полная цитата, автор (pt 8) и роль.
 */
function ReviewFull({ review }: { review: ReviewData }) {
  return (
    <figure className="flex flex-col gap-5 px-3 pt-2 pb-10 text-text-primary md:gap-6 md:p-16">
      <figcaption className="flex min-h-10 items-center text-overline uppercase md:min-h-0">
        Отзыв
      </figcaption>
      <StepDivider short className="flex w-full" />
      <blockquote className="text-quote whitespace-pre-line">
        {review.text.map((part, i) =>
          part.strong ? (
            <strong key={i} className="font-semibold">
              {part.text}
            </strong>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </blockquote>
      <div className="flex flex-col gap-1 md:pt-2">
        <span className="text-author uppercase">{review.author}</span>
        <span className="text-caption text-text-secondary">{review.role}</span>
      </div>
    </figure>
  )
}
