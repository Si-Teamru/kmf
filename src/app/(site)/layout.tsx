import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import React from 'react'

import './globals.css'

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KMF — мебель на заказ',
  description: 'Корпусная мебель на заказ по индивидуальным проектам',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
