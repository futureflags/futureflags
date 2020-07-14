import { Expr, query as q } from 'faunadb'

export const IfNotExists = (
  ref: Expr,
  whenTrue: Expr,
  whenFalse: Expr | null = null
) => q.If(q.Not(q.Exists(ref)), whenTrue, whenFalse)
