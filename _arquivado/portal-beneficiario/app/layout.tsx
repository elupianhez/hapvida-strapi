import type { Metadata } from 'next'
import React from 'react'

import { buscarAparencia } from '@/lib/cms'

import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Portal do Beneficiário (PoC)',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // O tema vem do CMS: trocar a marca no admin muda o portal também.
  const { marca } = await buscarAparencia()

  return (
    <html data-brand={marca} lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
