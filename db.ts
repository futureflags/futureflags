import { Client, values, query as q } from 'faunadb'
import { Collections, Functions, Indexes } from './schema'

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
  rate: number
}

export type NewFeatureData = Feature

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
    q.Call(Functions.isFeatureEnabled, { userCode, featureName })
  )
}

export async function getFeaturesByUser(
  userCode: Flag['userCode'],
  client = connect()
) {
  const { featuresName, featuresEnabled } = await client.query<{
    featuresName: Page<Feature['name']>
    featuresEnabled: boolean[]
  }>(
    q.Let(
      {
        featuresName: q.Paginate(q.Match(q.Index(Indexes.featuresName))),
        featuresEnabled: q.Map(
          q.Select('data', q.Var('featuresName')),
          (featureName) =>
            q.Call(Functions.isFeatureEnabled, {
              userCode,
              featureName,
            })
        ),
      },
      {
        featuresName: q.Var('featuresName'),
        featuresEnabled: q.Var('featuresEnabled'),
      }
    )
  )

  return featuresName.data.reduce((newObj, name, index) => {
    return {
      ...newObj,
      [name]: featuresEnabled[index],
    }
  }, {})
}
