require('dotenv-flow').config()

import { Client, query as q } from 'faunadb'
import { IfNotExists } from './utils'

enum Collections {
  users = 'users',
  projects = 'projects',
  features = 'features',
  pjUsers = 'pj_users',
  pjUserFeatures = 'pj_user_features',
}

enum Indexes {
  userByEmail = 'user_by_email',
  pjUserByCode = 'pj_user_by_code',
}

async function setup() {
  const secret = process.env.FAUNADB_ADMIN_SECRET

  if (!secret) {
    throw new Error('No FAUNADB_ADMIN_SECRET defined.')
  }

  const client = new Client({ secret })

  await client.query(
    q.Do(
      IfNotExists(
        q.Collection(Collections.users),
        q.CreateCollection({ name: Collections.users })
      ),
      IfNotExists(
        q.Collection(Collections.projects),
        q.CreateCollection({ name: Collections.projects })
      ),
      IfNotExists(
        q.Collection(Collections.features),
        q.CreateCollection({ name: Collections.features })
      ),
      IfNotExists(
        q.Collection(Collections.pjUsers),
        q.CreateCollection({ name: Collections.pjUsers })
      ),
      IfNotExists(
        q.Collection(Collections.pjUserFeatures),
        q.CreateCollection({ name: Collections.pjUserFeatures })
      )
    )
  )

  await client.query(
    q.Do(
      IfNotExists(
        q.Index(Indexes.userByEmail),
        q.CreateIndex({
          source: q.Collection(Collections.users),
          name: Indexes.userByEmail,
          terms: [{ field: ['data', 'email'], unique: true }],
        })
      ),
      IfNotExists(
        q.Index(Indexes.pjUserByCode),
        q.CreateIndex({
          source: q.Collection(Collections.pjUsers),
          name: Indexes.pjUserByCode,
          terms: [{ field: ['data', 'code'], unique: true }],
        })
      )
    )
  )
}

setup()
  .then(() => {
    console.log('✅ Setup completed!')
  })
  .catch((error: Error) => {
    console.error(error)
  })
