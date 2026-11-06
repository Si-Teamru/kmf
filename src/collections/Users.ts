import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  // Кука входа в админку — только по HTTPS на сервере (по умолчанию Payload ставит её без Secure).
  auth: { cookies: { secure: process.env.NODE_ENV === 'production' } },
  fields: [],
}
