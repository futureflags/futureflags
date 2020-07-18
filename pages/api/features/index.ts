require('dotenv-flow').config()

import { NextApiRequest, NextApiResponse } from 'next'
import { createFeature, parseDoc, connect } from '../_db'
import { controller, cors, HttpError, verifyAuth } from '../_utils'
import * as yup from 'yup'

type NewProjectData = {
  name: string
}

const newProjectValidator = yup.object().shape({
  name: yup.string().required(),
})

async function createFeatureEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = connect()
  const newProjectData = req.body as NewProjectData

  try {
    await newProjectValidator.validate(newProjectData)
    const featureDoc = await createFeature(newProjectData, client)

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
