require('dotenv-flow').config()

import { query as q } from 'faunadb'
import { connect } from '../db'
import { Collections, Indexes } from '../schema'
import { IfNotExists } from './utils'

export default async function setup() {
  const client = connect()

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

  await client.query(
    q.Do(
      IfNotExists(
        q.Index(Indexes.featureByName),
        q.CreateIndex({
          name: Indexes.featureByName,
          source: q.Collection(Collections.features),
          terms: [{ field: ['data', 'name'] }],
          unique: true,
        })
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
