require('dotenv-flow').config()

import { errors } from 'faunadb'
import { NextApiRequest, NextApiResponse } from 'next'
import { isFeatureEnabled } from '../../../../../db'
import { controller, cors, NotFound } from '../../../_utils'

async function getFlagEndpoint(req: NextApiRequest, res: NextApiResponse) {
  try {
    const name = req.query.name as string
    const userCode = req.query.userCode as string
    const isEnabled = await isFeatureEnabled(name, userCode)

    res.json({ enabled: isEnabled })
  } catch (error) {
    if (error instanceof errors.BadRequest) {
      throw new NotFound()
    }
  }
}

export default controller(async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'GET') {
    await getFlagEndpoint(req, res)
  } else {
    throw new NotFound()
  }
})
