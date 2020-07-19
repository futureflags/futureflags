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
      ),
      IfNotExists(
        q.Index(Indexes.flag),
        q.CreateIndex({
          name: Indexes.flag,
          source: q.Collection(Collections.flags),
          terms: [
            { field: ['data', 'feature'] },
            { field: ['data', 'userCode'] },
          ],
          unique: true,
        })
      ),
      IfNotExists(
        q.Index(Indexes.isFeatureEnabledByUser),
        q.CreateIndex({
          name: Indexes.isFeatureEnabledByUser,
          source: q.Collection(Collections.flags),
          terms: [
            { field: ['data', 'feature'] },
            { field: ['data', 'userCode'] },
            { field: ['data', 'enabled'] },
          ],
        })
      ),
      IfNotExists(
        q.Index(Indexes.flagsByFeature),
        q.CreateIndex({
          name: Indexes.flagsByFeature,
          source: q.Collection(Collections.flags),
          terms: [{ field: ['data', 'feature'] }],
        })
      ),
      IfNotExists(
        q.Index(Indexes.enabledFlagsByFeature),
        q.CreateIndex({
          name: Indexes.enabledFlagsByFeature,
          source: q.Collection(Collections.flags),
          terms: [
            { field: ['data', 'feature'] },
            { field: ['data', 'enabled'] },
          ],
        })
      ),
      IfNotExists(
        q.Index(Indexes.userCodes),
        q.CreateIndex({
          name: Indexes.userCodes,
          source: q.Collection(Collections.flags),
          values: [{ field: ['data', 'userCode'] }],
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
