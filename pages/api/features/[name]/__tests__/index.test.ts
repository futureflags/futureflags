import featuresFunction from '../index'
import { createFeature, Feature } from '../../../../../db'
import { callApi, mountFeature } from '../../../_testUtils'

describe('GET /feature/[name]', () => {
  test('get a feature', async () => {
    const featureDoc = await createFeature(mountFeature())

    const { res } = await callFeatureGet(featureDoc.data.name)

    expect(res.statusCode).toEqual(200)
    expect(res.jsonBody.feature.id).toEqual(expect.any(String))
    expect(res.jsonBody.feature.name).toEqual(featureDoc.data.name)
    expect(res.jsonBody.feature.enabled).toEqual(false)
  })
})

async function callFeatureGet(name: Feature['name']) {
  return callApi(featuresFunction, {
    query: { name },
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      authorization: process.env.ADMIN_KEY,
    },
  })
}
