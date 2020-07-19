import featuresFunction from '../index'
import {
  addFlag,
  createFeature,
  Feature,
  isFeatureEnabled,
} from '../../../../../../db'
import { callApi, mountFeature } from '../../../../_testUtils'
import faker from 'faker'
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript'

describe('GET /feature/[name]/[userCode]', () => {
  test('feature is enabled', async () => {
    const userCode = faker.random.uuid()
    const featureDoc = await createFeature(mountFeature({ enabled: true }))

    const { res } = await callFlagGet(featureDoc.data.name, userCode)

    expect(res.statusCode).toEqual(200)
    expect(res.jsonBody.enabled).toBeTruthy()
  })

  test('feature is not enabled', async () => {
    const userCode = faker.random.uuid()
    const featureDoc = await createFeature(mountFeature({ enabled: false }))

    const { res } = await callFlagGet(featureDoc.data.name, userCode)

    expect(res.statusCode).toEqual(200)
    expect(res.jsonBody.enabled).toBeFalsy()
  })

  test('feature is enabled only for specific user', async () => {
    const userACode = faker.random.uuid()
    const userBCode = faker.random.uuid()
    const featureDoc = await createFeature(mountFeature({ enabled: false }))
    await addFlag({
      featureName: featureDoc.data.name,
      userCode: userACode,
      enabled: true,
    })

    const { res: resUserA } = await callFlagGet(featureDoc.data.name, userACode)
    const { res: resUserB } = await callFlagGet(featureDoc.data.name, userBCode)

    expect(resUserA.jsonBody.enabled).toBeTruthy()
    expect(resUserB.jsonBody.enabled).toBeFalsy()
  })

  test('feature is enabled only for a rate', async () => {
    const userACode = faker.random.uuid()
    const userBCode = faker.random.uuid()
    const userCCode = faker.random.uuid()
    const userDCode = faker.random.uuid()

    const featureDoc = await createFeature(
      mountFeature({ enabled: true, rate: 50 })
    )

    const { res: resUserA } = await callFlagGet(featureDoc.data.name, userACode)
    const { res: resUserB } = await callFlagGet(featureDoc.data.name, userBCode)
    const { res: resUserC } = await callFlagGet(featureDoc.data.name, userCCode)
    const { res: resUserD } = await callFlagGet(featureDoc.data.name, userDCode)

    expect(resUserA.jsonBody.enabled).toBeTruthy()
    expect(resUserB.jsonBody.enabled).toBeFalsy()
    expect(resUserC.jsonBody.enabled).toBeTruthy()
    expect(resUserD.jsonBody.enabled).toBeFalsy()
  })
})

async function callFlagGet(name: Feature['name'], userCode: string) {
  return callApi(featuresFunction, {
    query: { name, userCode },
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      authorization: process.env.ADMIN_KEY,
    },
  })
}
