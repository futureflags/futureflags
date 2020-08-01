import { IncomingMessage } from 'http'
import {
  NextApiRequestCookies,
  NextApiRequestQuery,
} from 'next/dist/next-server/server/api-utils'
import { Socket } from 'net'
import { ServerResponse } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Env } from 'next/dist/lib/load-env-config'
import { ApiFunction } from './_types'
import { NewFeatureData } from '../../db'
import faker from 'faker'

export type NextApiRequestOptions = Partial<NextApiRequestMock>
export class NextApiRequestMock extends IncomingMessage
  implements NextApiRequest {
  public query: NextApiRequestQuery = {}
  public cookies: NextApiRequestCookies = {}
  public env: Env = {}
  public body: any

  constructor(options?: NextApiRequestOptions) {
    super(new Socket())

    if (options) {
      this.method = options.method
      this.body = options.body
      this.query = options.query || {}
      this.headers = options.headers || {}
      this.env = options.env || {}
    }
  }
}

export class NextApiResponseMock extends ServerResponse
  implements NextApiResponse {
  public body: any
  public jsonBody: any

  send(body: any) {
    this.body = body
  }

  json(jsonBody: any) {
    this.jsonBody = jsonBody
  }

  status(statusCode: number) {
    this.statusCode = statusCode
    return this
  }

  setPreviewData() {
    return this
  }

  clearPreviewData() {
    return this
  }
}

export async function callApi(
  apiFunction: ApiFunction,
  params: Partial<NextApiRequest>
) {
  const req = new NextApiRequestMock(params)
  const res = new NextApiResponseMock(req)

  await apiFunction(req, res)

  return {
    res,
    req,
  }
}

export function mountFeature(
  data: Partial<NewFeatureData> = {}
): NewFeatureData {
  return {
    name: faker.internet.domainWord(),
    rate: 0,
    ...data,
  }
}
