require('dotenv-flow').config()

import { Client, query as q } from 'faunadb'
import { Collections } from '../schema'
import { IfNotExists } from './utils'

export default async function setup() {
  const secret = process.env.FAUNADB_ADMIN_SECRET

  if (!secret) {
    throw new Error('No FAUNADB_ADMIN_SECRET defined.')
  }

  const client = new Client({ secret })

  await client.query(
    q.Do(
      IfNotExists(
        q.Collection(Collections.features),
        q.CreateCollection({ name: Collections.features })
      ),
      IfNotExists(
        q.Collection(Collections.flags),
        q.CreateCollection({ name: Collections.flags })
      )
    )
  )
}

setup()
  .then(() => {
    console.info('✅ Setup completed!')
  })
  .catch((error: Error) => {
    console.error(error)
  })
