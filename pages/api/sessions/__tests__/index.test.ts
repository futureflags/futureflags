import { callApi } from '../../_testUtils'
import sessionsFunction from '../index'
import faker from 'faker'
import { connect, createUser } from '../../_db'

const client = connect()

describe('POST /sessions', () => {
  test('session creation flow', async () => {
    const params = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    await createUser(params, client)

    const { res } = await callApi(sessionsFunction, {
      query: params,
      method: 'POST',
    })

    expect(res.statusCode).toEqual(201)
    expect(res.jsonBody.session.secret).toEqual(expect.any(String))
  })

  test('non existent user email', async () => {
    const params = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    await createUser(params, client)

    const { res } = await callApi(sessionsFunction, {
      query: {
        ...params,
        email: faker.internet.email(),
      },
      method: 'POST',
    })

    expect(res.statusCode).toEqual(400)
    expect(res.jsonBody).toEqual(['invalid email or password'])
  })

  test('non existent user password', async () => {
    const params = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    await createUser(params, client)

    const { res } = await callApi(sessionsFunction, {
      query: {
        ...params,
        password: faker.internet.password(),
      },
      method: 'POST',
    })

    expect(res.statusCode).toEqual(400)
    expect(res.jsonBody).toEqual(['invalid email or password'])
  })
})
