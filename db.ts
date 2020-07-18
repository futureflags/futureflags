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
}

export type NewFeatureData = {
  name: Feature['name']
  enabled?: Feature['enabled']
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
