require('dotenv-flow').config()

import { errors } from 'faunadb'
import { NextApiRequest, NextApiResponse } from 'next'
import { getFeaturesByUser } from '../../../../db'
import { controller, cors, NotFound } from '../../_utils'

async function getUserFeaturesEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const userCode = req.query.userCode as string
    const userFeatures = await getFeaturesByUser(userCode)

    res.json({ features: userFeatures })
  } catch (error) {
    if (error instanceof errors.BadRequest) {
      throw new NotFound()
    }
  }
}

export default controller(async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'GET') {
    await getUserFeaturesEndpoint(req, res)
  } else {
    throw new NotFound()
  }
})
