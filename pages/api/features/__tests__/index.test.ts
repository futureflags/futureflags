import { callApi } from '../../_testUtils'
import featuresFunction from '../index'
import faker from 'faker'

describe('POST /features', () => {
  test('feature creation flow', async () => {
    const params = {
      name: faker.internet.domainName(),
    }

    const { res } = await callApi(featuresFunction, {
      body: params,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: process.env.ADMIN_KEY,
      },
    })

    expect(res.statusCode).toEqual(201)
    expect(res.jsonBody.feature.id).toEqual(expect.any(String))
    expect(res.jsonBody.feature.name).toEqual(params.name)
  })
})
