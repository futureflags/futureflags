require('dotenv-flow').config()

import { NextApiRequest, NextApiResponse } from 'next'
import {
  createFeature,
  parseDoc,
  NewFeatureData,
  getAllFeatures,
} from '../../../db'
import { controller, cors, NotFound } from '../_utils'
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
  const defaultValues = { enabled: false }
  const newFeatureData: NewFeatureData = {
    ...defaultValues,
    ...req.body,
  }

  try {
    await newFeatureValidator.validate(newFeatureData)
    const featureDoc = await createFeature(newFeatureData)

    res.status(201).json({
      feature: parseDoc(featureDoc),
    })
  } catch (error) {
    res.status(400).json(error.errors)
  }
}

async function getFeaturesEndpoint(_req: NextApiRequest, res: NextApiResponse) {
  const features = await getAllFeatures()

  res.json({
    features: features.data.map((featureDoc) => parseDoc(featureDoc)),
  })
}

export default controller(async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'POST') {
    await createFeatureEndpoint(req, res)
  } else if (req.method === 'GET') {
    await getFeaturesEndpoint(req, res)
  } else {
    throw new NotFound()
  }
})
