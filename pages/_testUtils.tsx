import { ThemeProvider } from '@chakra-ui/core'
import { render as tlRender } from '@testing-library/react'
import { ReactElement } from 'react'
import { RouterContext } from 'next/dist/next-server/lib/router-context'
import { NextRouter } from 'next/router'

const mockRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
}

export function render(
  component: ReactElement,
  { router }: { router?: Partial<NextRouter> } = {}
) {
  const routerProps = { ...mockRouter, ...router }

  return {
    ...tlRender(
      <RouterContext.Provider value={routerProps}>
        <ThemeProvider>{component}</ThemeProvider>
      </RouterContext.Provider>
    ),
    router: routerProps,
  }
}
