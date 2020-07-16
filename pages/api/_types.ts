import { NextApiRequest, NextApiResponse } from 'next'

export type ApiFunction = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<any>
