import { NextApiRequest, NextApiResponse } from 'next'
import corsLib from 'cors'

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
