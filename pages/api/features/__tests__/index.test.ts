import { callApi } from '../../_testUtils'
import featuresFunction from '../index'
import faker from 'faker'
import { NewFeatureData } from '../../_db'

describe('POST /features', () => {
  test('feature creation', async () => {
    const feature = mountFeature()

    const { res } = await callFeaturesPost(feature)

    expect(res.statusCode).toEqual(201)
    expect(res.jsonBody.feature.id).toEqual(expect.any(String))
    expect(res.jsonBody.feature.name).toEqual(feature.name)
    expect(res.jsonBody.feature.enabled).toEqual(false)
  })

  test('enabled feature creation', async () => {
    const feature = mountFeature({ enabled: true })

    const { res } = await callFeaturesPost(feature)

    expect(res.statusCode).toEqual(201)
    expect(res.jsonBody.feature.id).toEqual(expect.any(String))
    expect(res.jsonBody.feature.name).toEqual(feature.name)
    expect(res.jsonBody.feature.enabled).toEqual(true)
  })

  test('unique name validation', async () => {
    const feature = mountFeature({ enabled: true })

    await callFeaturesPost(feature)
    const { res } = await callFeaturesPost(feature)

    expect(res.statusCode).toEqual(400)
  })
})

async function callFeaturesPost(data: NewFeatureData) {
  return callApi(featuresFunction, {
    body: data,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: process.env.ADMIN_KEY,
    },
  })
}

function mountFeature(data: Partial<NewFeatureData> = {}): NewFeatureData {
  return {
    name: faker.internet.domainWord(),
    ...data,
  }
}
