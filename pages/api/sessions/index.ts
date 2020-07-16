require('dotenv-flow').config()

import { NextApiRequest, NextApiResponse } from 'next'
import { connect, createSession } from '../_db'
import { cors } from '../_utils'
import * as yup from 'yup'
import { errors } from 'faunadb'

type NewSessionData = {
  email: string
  password: string
}

const newSessionValidator = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
})

async function createSessionEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = connect()
  const newSessionData = req.query as NewSessionData

  try {
    await newSessionValidator.validate(newSessionData)
    const sessionDoc = await createSession(newSessionData, client)

    res.status(201).json({
      session: {
        secret: sessionDoc.secret,
      },
    })
  } catch (error) {
    if (error instanceof errors.BadRequest) {
      res.status(400).json(['invalid email or password'])
    }
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)

  if (req.method === 'POST') {
    return createSessionEndpoint(req, res)
  }

  return res.status(404).end()
}
