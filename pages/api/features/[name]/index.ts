require('dotenv-flow').config()

import { errors } from 'faunadb'
import { NextApiRequest, NextApiResponse } from 'next'
import { getFeatureByName, parseDoc } from '../../_db'
import { controller, cors, NotFound } from '../../_utils'

async function getFeatureEndpoint(req: NextApiRequest, res: NextApiResponse) {
  try {
    const name = req.query.name as string

    const featureDoc = await getFeatureByName(name)

    res.json({
      feature: parseDoc(featureDoc),
    })
  } catch (error) {
    if (error instanceof errors.BadRequest) {
      throw new NotFound()
    }
  }
}

export default controller(async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'GET') {
    await getFeatureEndpoint(req, res)
  } else {
    throw new NotFound()
  }
})
