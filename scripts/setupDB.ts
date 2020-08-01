require('dotenv-flow').config()

import { query as q } from 'faunadb'
import { connect } from '../db'
import { Collections, Functions, Indexes } from '../schema'
import { IfNotExists } from './utils'

const isFeatureEnabledUDF = {
  name: Functions.isFeatureEnabled,
  body: q.Query((params) =>
    q.Let(
      {
        userCode: q.Select('userCode', params),
        featureDoc: q.Get(
          q.Match(
            q.Index(Indexes.featureByName),
            q.Select('featureName', params)
          )
        ),
        isFeatureEnabledToUser: q.Exists(
          q.Match(q.Index(Indexes.isFeatureEnabledByUser), [
            q.Select('ref', q.Var('featureDoc')),
            q.Var('userCode'),
            true,
          ])
        ),
        hasFlag: q.Exists(
          q.Match(q.Index('flag'), [
            q.Select('ref', q.Var('featureDoc')),
            q.Var('userCode'),
          ])
        ),
        rate: q.Select(['data', 'rate'], q.Var('featureDoc')),
      },
      q.Or(
        q.Var('isFeatureEnabledToUser'),
        q.Equals(q.Var('rate'), 100),
        q.Let(
          {
            totalUsers: q.Count(
              q.Distinct(q.Match(q.Index(Indexes.userCodes)))
            ),
            enabledUsers: q.Count(
              q.Match(q.Index(Indexes.enabledFlagsByFeature), [
                q.Select('ref', q.Var('featureDoc')),
                true,
              ])
            ),
            maxUsers: q.Multiply(
              q.Divide(q.Var('rate'), q.ToDouble(100)),
              q.Var('totalUsers')
            ),
            shouldEnable: q.GT(q.Var('maxUsers'), q.Var('enabledUsers')),
          },
          q.Do(
            q.If(
              q.Var('hasFlag'),
              null,
              q.Create(q.Collection(Collections.flags), {
                data: {
                  userCode: q.Var('userCode'),
                  feature: q.Select('ref', q.Var('featureDoc')),
                  enabled: q.Var('shouldEnable'),
                },
              })
            ),
            q.Var('shouldEnable')
          )
        )
      )
    )
  ),
}

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
        q.Index(Indexes.featuresName),
        q.CreateIndex({
          name: Indexes.featuresName,
          source: q.Collection(Collections.features),
          values: [{ field: ['data', 'name'] }],
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

  await client.query(
    q.Do(
      IfNotExists(
        q.Function(isFeatureEnabledUDF.name),
        q.CreateFunction(isFeatureEnabledUDF),
        q.Update(q.Function(isFeatureEnabledUDF.name), isFeatureEnabledUDF)
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
