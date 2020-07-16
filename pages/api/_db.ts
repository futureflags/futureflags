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

export function createUser(
  { email, password }: { email: string; password: string },
  client: Client
) {
  return client.query<Doc<any>>(
    q.Create(q.Collection(Collections.users), {
      data: { email },
      credentials: { password },
    })
  )
}

export function createSession(
  { email, password }: { email: string; password: string },
  client: Client
) {
  return client.query<{ secret: string }>(
    q.Login(q.Match(q.Index(Indexes.userByEmail), email), { password })
  )
}
