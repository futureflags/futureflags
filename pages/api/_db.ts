import { Client, values, query as q } from 'faunadb'
import { Collections } from '../../schema'

export type Doc<T> = {
  ts: number
  ref: values.Ref
  data: T
}

export type Model<T> = T & {
  id: string
}

export type NewFeatureData = {
  name: string
  enabled?: boolean
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

export function createFeature(data: NewFeatureData, client: Client) {
  return client.query<Doc<NewFeatureData>>(
    q.Create(q.Collection(Collections.features), {
      data: {
        ...data,
        name: data.name.toLowerCase().trim(),
      },
    })
  )
}
