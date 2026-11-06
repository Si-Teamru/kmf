import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Секреты и адреса — только из окружения: без переменной падаем сразу, а не работаем с пустой. */
const required = (name: string) => {
  const value = process.env[name]
  if (!value) throw new Error(`Не задана переменная окружения ${name}`)
  return value
}

export default buildConfig({
  // GraphQL сайту не нужен, а вход через него обходит лимиты на /api/users/login.
  graphQL: { disable: true },
  telemetry: false, // иначе при сборке и запуске данные о проекте уходят на telemetry.payloadcms.com
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: required('PAYLOAD_SECRET'),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: required('DATABASE_URL'),
    },
  }),
  sharp,
  plugins: [],
})
