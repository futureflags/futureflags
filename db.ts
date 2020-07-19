import { Client, values, query as q } from 'faunadb'
import { Collections, Indexes } from './schema'

export type Doc<T> = {
  ts: number
  ref: values.Ref
  data: T
}

export type Page<T> = {
  data: T[]
}

export type Model<T> = T & {
  id: string
}

export type Feature = {
  name: string
  enabled: boolean
  rate?: number
}

export type NewFeatureData = {
  name: Feature['name']
  enabled?: Feature['enabled']
  rate?: Feature['rate']
}

export type Flag = {
  userCode: string
  feature: values.Ref
  enabled: boolean
}

export type NewFlagData = {
  userCode: Flag['userCode']
  featureName: Feature['name']
  enabled: Flag['enabled']
}

export function connect() {
  const secret = process.env.FAUNADB_ADMIN_SECRET
  const faunadbCloudUrl = 'https://db.fauna.com:443'
  const url = new URL(process.env.FAUNADB_URL || faunadbCloudUrl)

  if (!secret) {
    throw new Error('No FAUNADB_ADMIN_SECRET defined.')
  }

  return new Client({
    secret,
    scheme: url.protocol.replace(':', '') as 'http' | 'https',
    domain: url.hostname,
    port: Number(url.port),
  })
}

export async function cleanup(collection: Collections, client = connect()) {
  await client.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection(collection)), { size: 1000 }),
      (ref) => q.Delete(ref)
    )
  )
}

export function parseDoc<T>(doc: Doc<T>): Model<T> {
  return {
    id: doc.ref.id,
    ...doc.data,
  }
}

export function createFeature(
  data: NewFeatureData,
  client: Client = connect()
) {
  return client.query<Doc<Feature>>(
    q.Create(q.Collection(Collections.features), {
      data: {
        ...data,
        name: data.name.toLowerCase().trim(),
      },
    })
  )
}

export function getAllFeatures(client: Client = connect()) {
  return client.query<Page<Doc<Feature>>>(
    q.Map(q.Paginate(q.Documents(q.Collection(Collections.features))), (ref) =>
      q.Get(ref)
    )
  )
}

export function getFeatureByName(
  name: Feature['name'],
  client: Client = connect()
) {
  return client.query<Doc<Feature>>(
    q.Get(q.Match(q.Index(Indexes.featureByName), name))
  )
}

export async function addFlag(data: NewFlagData, client = connect()) {
  return client.query(
    q.Let(
      {
        featureDoc: q.Get(
          q.Match(q.Index(Indexes.featureByName), data.featureName)
        ),
      },
      q.Create(q.Collection(Collections.flags), {
        data: {
          feature: q.Select('ref', q.Var('featureDoc')),
          userCode: data.userCode,
          enabled: data.enabled,
        },
      })
    )
  )
}

export async function isFeatureEnabled(
  featureName: Feature['name'],
  userCode: string,
  client = connect()
) {
  return client.query<boolean>(
    q.Let(
      {
        featureDoc: q.Get(q.Match(q.Index(Indexes.featureByName), featureName)),
        isFeatureEnabled: q.Select(['data', 'enabled'], q.Var('featureDoc')),
        existsRate: q.Contains(['data', 'rate'], q.Var('featureDoc')),
        isFlagEnabled: q.Exists(
          q.Match(q.Index(Indexes.isFeatureEnabledByUser), [
            q.Select('ref', q.Var('featureDoc')),
            userCode,
            true,
          ])
        ),
      },
      q.Or(
        q.Var('isFlagEnabled'),
        q.And(q.Var('isFeatureEnabled'), q.Not(q.Var('existsRate'))),
        q.If(
          q.Var('existsRate'),
          q.Let(
            {
              rateValue: q.Multiply(
                q.Divide(
                  q.Select(['data', 'rate'], q.Var('featureDoc')),
                  q.ToDouble(100)
                ),
                q.Add(
                  1,
                  q.Count(q.Distinct(q.Match(q.Index(Indexes.userCodes))))
                )
              ),
              currentValue: q.Add(
                q.Count(
                  q.Match(q.Index(Indexes.enabledFlagsByFeature), [
                    q.Select('ref', q.Var('featureDoc')),
                    true,
                  ])
                )
              ),
              shouldEnable: q.LT(q.Var('currentValue'), q.Var('rateValue')),
            },
            q.Do(
              q.Create(q.Collection(Collections.flags), {
                data: {
                  userCode,
                  feature: q.Select('ref', q.Var('featureDoc')),
                  enabled: q.Var('shouldEnable'),
                },
              }),
              q.Var('shouldEnable')
            )
          ),
          false
        )
      )
    )
  )
}
