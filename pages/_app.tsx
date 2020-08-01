import { AppContext, AppInitialProps } from 'next/app'
import { ThemeProvider, CSSReset } from '@chakra-ui/core'
import { theme } from '@chakra-ui/core'

function App({ Component, pageProps }: AppContext & AppInitialProps) {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
