require('dotenv-flow').config()

import { NextApiRequest, NextApiResponse } from 'next'
import { createFeature, parseDoc, connect } from '../_db'
import { controller, cors, HttpError, verifyAuth } from '../_utils'
import * as yup from 'yup'

type NewFeatureData = {
  name: string
}

const newFeatureValidator = yup.object().shape({
  name: yup.string().required(),
})

async function createFeatureEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = connect()
  const newFeatureData = req.body as NewFeatureData

  try {
    await newFeatureValidator.validate(newFeatureData)
    const featureDoc = await createFeature(newFeatureData, client)

    res.status(201).json({
      feature: parseDoc(featureDoc),
    })
  } catch (error) {
    res.status(400).json(error.errors)
  }
}

export default controller(async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'POST') {
    await createFeatureEndpoint(req, res)
  } else {
    throw new HttpError(404)
  }
})
