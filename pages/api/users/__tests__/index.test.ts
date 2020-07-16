import { callApi } from '../../_testUtils'
import usersFunction from '../index'
import faker from 'faker'

describe('POST /users', () => {
  test('user creation flow', async () => {
    const params = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    const { res } = await callApi(usersFunction, {
      query: params,
      method: 'POST',
    })

    expect(res.statusCode).toEqual(201)
    expect(res.jsonBody.user.id).toEqual(expect.any(String))
    expect(res.jsonBody.user.email).toEqual(params.email)
  })

  test('invalid user email', async () => {
    const params = {
      email: 'invalid email',
      password: faker.internet.password(),
    }
    const { res } = await callApi(usersFunction, {
      query: params,
      method: 'POST',
    })

    expect(res.statusCode).toEqual(400)
    expect(res.jsonBody).toEqual(['email must be a valid email'])
  })

  test('invalid user password', async () => {
    const params = {
      email: faker.internet.password(),
      password: 'short',
    }
    const { res } = await callApi(usersFunction, {
      query: params,
      method: 'POST',
    })

    expect(res.statusCode).toEqual(400)
    expect(res.jsonBody).toEqual(['password must be at least 6 characters'])
  })
})
