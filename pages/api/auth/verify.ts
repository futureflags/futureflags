import { NextApiRequest, NextApiResponse } from 'next'
import { controller, cors, NotFound, verifyAuth } from '../_utils'

export default controller(async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'GET') {
    verifyAuth(req)
    res.status(204).end()
  } else {
    throw new NotFound()
  }
})
