import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/**
 * STATIC_EXPORT=1 — статическая сборка страниц сайта для GitHub Pages (.github/workflows/pages.yml):
 * без сервера, в подпапке NEXT_PUBLIC_BASE_PATH, без оптимизации картинок.
 * Админка и API Payload в такую сборку не входят (workflow убирает src/app/(payload)).
 */
const staticExport = process.env.STATIC_EXPORT === '1'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined

const nextConfig: NextConfig = {
  ...(staticExport
    ? { output: 'export', basePath, trailingSlash: true }
    : { output: 'standalone' }),
  images: {
    unoptimized: staticExport,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      // Иконки UI-kit и статичные демо-фото до переноса контента в CMS.
      { pathname: '/icons/**' },
      { pathname: '/demo/**' },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
