import Home from '../index'
import { render } from '../_testUtils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { removeSession, saveSession } from '../_useAuth'

test('render sign in page when there is no session', () => {
  render(<Home />)

  screen.getByText(/dashboard access/i)
})

test('redirects to /panel when there is session', () => {
  saveSession({ secret: '123' })

  const { router } = render(<Home />)

  expect(router.push).toBeCalledTimes(1)
  expect(router.push).toBeCalledWith('/panel')

  removeSession()
})

test('redirects to /panel when submit right secret', async () => {
  fetchMock.mockResponseOnce('', { status: 204 })

  const { router } = render(<Home />)

  userEvent.type(screen.getByLabelText(/secret/i), '123')
  userEvent.click(screen.getByText(/access dashboard/i))

  await waitFor(() => expect(router.push).toBeCalledTimes(1))
  expect(router.push).toBeCalledWith('/panel')

  removeSession()
})

test('show error when secret is wrong', async () => {
  fetchMock.mockResponseOnce('', { status: 401 })

  render(<Home />)

  userEvent.type(screen.getByLabelText(/secret/i), '123')
  userEvent.click(screen.getByText(/access dashboard/i))

  await screen.findByText(/secret is not valid/i)
})
