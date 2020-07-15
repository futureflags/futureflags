import { NextApiRequest, NextApiResponse } from 'next'
import corsLib from 'cors'
import { initMiddleware } from './_utils'

const cors = initMiddleware(
  corsLib({
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  res.statusCode = 200
  res.json({ name: 'John Doe' })
}
