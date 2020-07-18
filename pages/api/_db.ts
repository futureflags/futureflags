import { Client, values, query as q } from 'faunadb'
import { Collections, Indexes } from '../../schema'

export type Doc<T> = {
  ts: number
  ref: values.Ref
  data: T
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

  if (!secret) {
    throw new Error('No FAUNADB_ADMIN_SECRET defined.')
  }

  return new Client({ secret })
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

export function getFeatureByName(
  name: Feature['name'],
  client: Client = connect()
) {
  return client.query<Doc<Feature>>(
    q.Get(q.Match(q.Index(Indexes.featureByName), name))
  )
}
