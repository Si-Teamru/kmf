import type { Metadata } from 'next'
import React from 'react'

import { Header } from '@/components/blocks/Header'

// Manrope хранится локально (Google Fonts из РФ отвечает нестабильно).
import '@fontsource-variable/manrope'
import './globals.css'

export const metadata: Metadata = {
  title: 'KMF — мебель на заказ',
  description: 'Корпусная мебель на заказ по индивидуальным проектам',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
