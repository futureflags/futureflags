import featuresFunction from '../features'
import { createFeature } from '../../../../../db'
import { callApi, mountFeature } from '../../../_testUtils'

describe('GET /users/[userCode]/features', () => {
  test('user features list', async () => {
    const userACode = 'userA'
    const userBCode = 'userB'
    const userCCode = 'userC'
    const userDCode = 'userD'

    const featureA = await createFeature(
      mountFeature({ name: 'featurea', rate: 25 })
    )
    const featureB = await createFeature(
      mountFeature({ name: 'featureb', rate: 50 })
    )
    const featureC = await createFeature(
      mountFeature({ name: 'featurec', rate: 75 })
    )

    const { res: resUserA } = await callUserFeatures(userACode)
    const { res: resUserB } = await callUserFeatures(userBCode)
    const { res: resUserC } = await callUserFeatures(userCCode)
    const { res: resUserD } = await callUserFeatures(userDCode)

    expect(resUserA.jsonBody.features).toMatchObject({
      [featureA.data.name]: false,
      [featureB.data.name]: true,
      [featureC.data.name]: true,
    })
    expect(resUserB.jsonBody.features).toMatchObject({
      [featureA.data.name]: true,
      [featureB.data.name]: false,
      [featureC.data.name]: true,
    })
    expect(resUserC.jsonBody.features).toMatchObject({
      [featureA.data.name]: false,
      [featureB.data.name]: true,
      [featureC.data.name]: true,
    })
    expect(resUserD.jsonBody.features).toMatchObject({
      [featureA.data.name]: false,
      [featureB.data.name]: false,
      [featureC.data.name]: false,
    })
  })
})

async function callUserFeatures(userCode: string) {
  return callApi(featuresFunction, {
    query: { userCode },
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      authorization: process.env.ADMIN_KEY,
    },
  })
}
