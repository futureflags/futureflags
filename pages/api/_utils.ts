import { NextApiRequest, NextApiResponse } from 'next'
import corsLib from 'cors'
import { ApiFunction } from './_types'

export function initMiddleware(middleware: any) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
}

export const cors = initMiddleware(
  corsLib({
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)

export class HttpError extends Error {
  public statusCode: number

  constructor(statusCode: number, message: string) {
    super(`${statusCode}: ${message}`)
    this.statusCode = statusCode
  }
}

export class NotFound extends HttpError {
  constructor() {
    super(404, 'Not found')
  }
}

export function isHttpError(error: any): error is HttpError {
  return 'statusCode' in error
}

export const verifyJSON = (req: NextApiRequest) => {
  if (req.headers['content-type'] !== 'application/json') {
    throw new HttpError(400, 'Only application/json body is accepted')
  }
}

export const verifyAuth = (req: NextApiRequest) => {
  const key = req.headers.authorization

  switch (key) {
    case process.env.ADMIN_KEY:
      return

    case undefined:
      throw new HttpError(401, 'Authorization key not found')

    default:
      throw new HttpError(401, 'Unauthorized')
  }
}

export const controller = (apiFunction: ApiFunction) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    verifyJSON(req)
    await apiFunction(req, res)
  } catch (error) {
    if (isHttpError(error)) {
      res.status(error.statusCode).json({ message: error.message })
      return
    }

    throw error
  }
}
