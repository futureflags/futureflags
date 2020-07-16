require('dotenv-flow').config()

import { NextApiRequest, NextApiResponse } from 'next'
import { connect, createUser, Doc, parseDoc } from '../_db'
import { cors } from '../_utils'
import * as yup from 'yup'

type NewUserData = {
  email: string
  password: string
}

const newUserValidator = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
})

async function createUserEndpoint(req: NextApiRequest, res: NextApiResponse) {
  const client = connect()
  const newUserData = req.query as NewUserData

  try {
    await newUserValidator.validate(newUserData)
    const userDoc = await createUser(newUserData, client)

    res.status(201).json({
      user: parseDoc(userDoc),
    })
  } catch (error) {
    res.status(400).json(error.errors)
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'POST') {
    return createUserEndpoint(req, res)
  }

  return res.status(404).end()
}
