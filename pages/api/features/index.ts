require('dotenv-flow').config()

import { NextApiRequest, NextApiResponse } from 'next'
import { createFeature, parseDoc, connect, NewFeatureData } from '../_db'
import { controller, cors, HttpError } from '../_utils'
import * as yup from 'yup'

const onlyEmailCharacters = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/

const newFeatureValidator = yup.object().shape({
  name: yup.string().matches(onlyEmailCharacters),
  enabled: yup.bool().required(),
})

async function createFeatureEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = connect()
  const defaultValues = { enabled: false }
  const newFeatureData: NewFeatureData = {
    ...defaultValues,
    ...req.body,
  }

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
